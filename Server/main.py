import asyncio
import json
import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import AsyncIterator, Dict, List, Optional

from dotenv import load_dotenv

# Load .env before any module that reads os.getenv()
load_dotenv()

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import StreamingResponse  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from Langraph.Agent import graph  # noqa: E402
from Langraph.State import AgentState  # noqa: E402

# ── Thread pool (graph.stream / graph.invoke are synchronous) ──────────────────
_executor = ThreadPoolExecutor(max_workers=4)

# ── In-memory job store for background jobs (swap for Redis in production) ─────
_jobs: Dict[str, dict] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    _executor.shutdown(wait=False)


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Kineo — Manim Agent API",
    description=(
        "Generate and edit Manim animations via an AI agent pipeline.\n\n"
        "### Two ways to call the agent\n"
        "| Style | Endpoints | Best for |\n"
        "|---|---|---|\n"
        "| **Streaming (SSE)** | `/generate/stream`, `/edit/stream` | Watching progress live in Swagger or a frontend |\n"
        "| **Background job** | `/generate`, `/edit` + `/status/{id}` | Fire-and-forget, polling from a client |\n"
    ),
    version="0.1.0",
    lifespan=lifespan,
)

origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
allow_origins = [o.strip() for o in origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response schemas ─────────────────────────────────────────────────


class GenerateRequest(BaseModel):
    prompt: str
    max_iterations: int = 5


class EditRequest(BaseModel):
    prompt: str
    previous_code: str
    previous_plan: Optional[str] = None
    max_iterations: int = 5


class JobCreatedResponse(BaseModel):
    job_id: str
    status: str = "pending"


class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # pending | running | done | failed
    video_url: Optional[str]  # latest Cloudinary URL
    video_urls: List[str]  # all Cloudinary URLs across retries
    plan: Optional[str]
    code: Optional[str]
    error: Optional[str]
    iterations: int


# ── SSE helpers ────────────────────────────────────────────────────────────────


def _normalize_update(raw) -> dict:
    """Accept an AgentState instance or a plain dict and return a dict."""
    if hasattr(raw, "model_dump"):
        return raw.model_dump()
    if isinstance(raw, dict):
        return raw
    return {}


def _build_node_event(node: str, update: dict) -> dict:
    """
    Build the SSE payload for a single node completion.
    Only include fields that are meaningful for that node.
    """
    if node == "detect_mode":
        return {
            "type": "node",
            "node": node,
            "message": "🔍 Detecting request mode…",
            "is_edit": update.get("is_edit_request", False),
        }

    if node == "plan":
        return {
            "type": "node",
            "node": node,
            "message": "📋 Plan ready",
            "plan": update.get("plan"),
        }

    if node == "code":
        return {
            "type": "node",
            "node": node,
            "message": "💻 Code generated",
            "code": update.get("code"),
        }

    if node == "render":
        urls: list = update.get("video_urls", [])
        error = update.get("current_error")
        return {
            "type": "node",
            "node": node,
            "message": "✅ Render complete!" if not error else "❌ Render failed",
            "iteration": update.get("iteration", 0),
            "video_url": urls[-1] if urls else None,
            "video_urls": urls,
            "error": error,
        }

    if node == "fix":
        return {
            "type": "node",
            "node": node,
            "message": "🔧 Fixing code error…",
            "error_type": update.get("error_type"),
        }

    # Fallback for any future node
    return {"type": "node", "node": node, "message": f"⚙️ Node '{node}' completed"}


def _sse(payload: dict) -> str:
    """Format a dict as a single SSE data line."""
    return f"data: {json.dumps(payload)}\n\n"


async def _stream_graph(initial_state: AgentState) -> AsyncIterator[str]:
    """
    Async generator that runs graph.stream() in a thread and yields
    SSE-formatted strings as each node completes.
    """
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def _run():
        try:
            # stream_mode="updates" yields {node_name: state_returned_by_node}
            for chunk in graph.stream(initial_state, stream_mode="updates"):
                asyncio.run_coroutine_threadsafe(queue.put(("chunk", chunk)), loop)
        except Exception as exc:
            asyncio.run_coroutine_threadsafe(queue.put(("error", str(exc))), loop)
        finally:
            asyncio.run_coroutine_threadsafe(queue.put(("done", None)), loop)

    _executor.submit(_run)

    while True:
        kind, payload = await queue.get()

        if kind == "error":
            yield _sse({"type": "error", "message": payload})
            break

        if kind == "done":
            yield _sse({"type": "done"})
            break

        # payload = {node_name: raw_update, ...}
        for node_name, raw_update in payload.items():
            update = _normalize_update(raw_update)
            yield _sse(_build_node_event(node_name, update))


# ── Background-job helpers ─────────────────────────────────────────────────────


def _blank_job() -> dict:
    return {
        "status": "pending",
        "video_urls": [],
        "plan": None,
        "code": None,
        "error": None,
        "iterations": 0,
    }


def _run_graph_bg(job_id: str, initial_state: AgentState) -> None:
    """Run graph.invoke() in a thread and write the result into _jobs."""
    _jobs[job_id]["status"] = "running"
    try:
        result = graph.invoke(initial_state)
        final: AgentState = AgentState(**result) if isinstance(result, dict) else result
        _jobs[job_id].update(
            {
                "status": "done",
                "video_urls": final.video_urls,
                "plan": final.plan,
                "code": final.code,
                "error": final.current_error,
                "iterations": final.iteration,
            }
        )
    except Exception as exc:
        _jobs[job_id].update({"status": "failed", "error": str(exc)})


# ── Routes ─────────────────────────────────────────────────────────────────────


@app.get("/health", tags=["Meta"])
def health():
    """Quick liveness check."""
    return {"status": "ok"}


# ── Streaming endpoints ────────────────────────────────────────────────────────


@app.post(
    "/generate/stream",
    tags=["Streaming"],
    summary="Generate a new animation — streaming (SSE)",
    response_class=StreamingResponse,
    responses={
        200: {
            "content": {"text/event-stream": {}},
            "description": (
                "Server-Sent Events stream. Each `data:` line is a JSON object.\n\n"
                "| `type` | When |\n"
                "|---|---|\n"
                "| `node` | A pipeline node finished — `node` field names it |\n"
                "| `done` | Pipeline complete |\n"
                "| `error` | Unrecoverable failure — check `message` |\n"
            ),
        }
    },
)
async def generate_stream(req: GenerateRequest):
    """
    Run the full agent pipeline and stream a Server-Sent Event for every node
    that completes (`detect_mode` → `plan` → `code` → `render` → optionally `fix`).

    **How to read events in Swagger:** click *Execute* and watch the *Response body*
    fill in line-by-line as each stage of the pipeline finishes.
    """
    initial_state = AgentState(
        prompt=req.prompt,
        max_iterations=req.max_iterations,
    )
    return StreamingResponse(
        _stream_graph(initial_state),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


@app.post(
    "/edit/stream",
    tags=["Streaming"],
    summary="Edit an existing animation — streaming (SSE)",
    response_class=StreamingResponse,
    responses={
        200: {
            "content": {"text/event-stream": {}},
            "description": "Same SSE format as `/generate/stream`.",
        }
    },
)
async def edit_stream(req: EditRequest):
    """
    Re-run the agent pipeline with an edit instruction and stream progress events.

    Pass the previously generated `code` as `previous_code` and plan as `previous_plan`.
    """
    initial_state = AgentState(
        prompt=req.prompt,
        previous_code=req.previous_code,
        previous_plan=req.previous_plan,
        max_iterations=req.max_iterations,
    )
    return StreamingResponse(
        _stream_graph(initial_state),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


# ── Background-job endpoints ───────────────────────────────────────────────────


@app.post(
    "/generate",
    response_model=JobCreatedResponse,
    status_code=202,
    tags=["Background Job"],
    summary="Generate a new animation — background job",
)
async def generate(req: GenerateRequest):
    """
    Start a generation job and return a `job_id` immediately.
    Poll `GET /status/{job_id}` until `status` is `done` or `failed`.
    """
    job_id = str(uuid.uuid4())
    _jobs[job_id] = _blank_job()

    initial_state = AgentState(
        prompt=req.prompt,
        max_iterations=req.max_iterations,
    )

    loop = asyncio.get_running_loop()
    loop.run_in_executor(_executor, _run_graph_bg, job_id, initial_state)

    return JobCreatedResponse(job_id=job_id)


@app.post(
    "/edit",
    response_model=JobCreatedResponse,
    status_code=202,
    tags=["Background Job"],
    summary="Edit an existing animation — background job",
)
async def edit(req: EditRequest):
    """
    Start an edit job and return a `job_id` immediately.
    Pass the original `code` as `previous_code` and plan as `previous_plan`.
    """
    job_id = str(uuid.uuid4())
    _jobs[job_id] = _blank_job()

    initial_state = AgentState(
        prompt=req.prompt,
        previous_code=req.previous_code,
        previous_plan=req.previous_plan,
        max_iterations=req.max_iterations,
    )

    loop = asyncio.get_running_loop()
    loop.run_in_executor(_executor, _run_graph_bg, job_id, initial_state)

    return JobCreatedResponse(job_id=job_id)


@app.get(
    "/status/{job_id}",
    response_model=JobStatusResponse,
    tags=["Background Job"],
    summary="Poll a background job for status and result",
)
def job_status(job_id: str):
    """
    Returns the current state of a background generation/edit job.

    | `status`  | Meaning |
    |-----------|---------|
    | `pending` | Queued, not started yet |
    | `running` | Agent pipeline is executing |
    | `done`    | Finished — `video_url` is ready |
    | `failed`  | Unrecoverable error — check `error` |
    """
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")

    urls: List[str] = job.get("video_urls", [])
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        video_url=urls[-1] if urls else None,
        video_urls=urls,
        plan=job.get("plan"),
        code=job.get("code"),
        error=job.get("error"),
        iterations=job.get("iterations", 0),
    )
