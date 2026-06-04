import traceback
from pathlib import Path

import modal

from Langraph.State import AgentState
from Modal.function import extract_scene_class
from Utils.cloudinary_upload import upload_video_to_cloudinary

# Uses the already-deployed Modal function
render_manim = modal.Function.from_name(
    "agent-manim-renderer",
    "render_manim",
)


def render_video_node(state: AgentState) -> AgentState:
    if not state.code:
        state.current_error = "No code found in state.code"
        state.error_type = "logic"
        return state

    try:
        print(f"🚀 Rendering video (iteration {state.iteration})...")

        scene_class = extract_scene_class(state.code)

        with modal.enable_output():
            video_bytes = render_manim.remote(
                state.code,
                scene_class,
            )

        # Local backup
        Path("renders").mkdir(exist_ok=True)

        local_path = f"renders/render_iter_{state.iteration}.mp4"

        with open(local_path, "wb") as f:
            f.write(video_bytes)

        state.worker_output.append(local_path)

        # Upload to Cloudinary
        public_id = f"render_iter_{state.iteration}"

        cloudinary_url = upload_video_to_cloudinary(
            video_bytes,
            public_id,
        )

        state.video_urls.append(cloudinary_url)

        print(f"☁️ Video uploaded to Cloudinary: {cloudinary_url}")

        state.current_error = None
        state.error_type = None

        print("✅ Render successful!")

    except Exception:
        print("❌ Render failed.")

        import sys

        error_str = traceback.format_exc() + "\n" + str(sys.exc_info()[1])

        state.current_error = error_str

        if "SyntaxError" in error_str:
            state.error_type = "syntax"

        elif "ModuleNotFoundError" in error_str or "ImportError" in error_str:
            state.error_type = "env"

        elif "AttributeError" in error_str or "TypeError" in error_str:
            state.error_type = "runtime"

        elif "ffmpeg" in error_str.lower():
            state.error_type = "env"

        else:
            state.error_type = "logic"

    state.iteration += 1
    return state
