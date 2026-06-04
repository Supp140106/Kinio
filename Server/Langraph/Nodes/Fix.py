from Langraph.Nodes.Code import strip_code_fences
from Langraph.State import AgentState
from LLM.openai import llm


def fix_node(state: AgentState) -> AgentState:
    """Applies a minimal fix for syntax / runtime errors without re-planning."""
    prompt = (
        "Fix the Manim code below. Apply the MINIMAL change needed to resolve the error.\n"
        "Do NOT rewrite the entire scene — preserve all existing logic and layout.\n"
        "Return only the corrected Python code (no markdown fences, no explanations).\n\n"
        "Layout rules to preserve:\n"
        "  - Title stays at the top (.to_edge(UP)).\n"
        "  - Main content stays centred (.move_to(ORIGIN)).\n"
        "  - Every Text/MathTex must fit within 11 units wide (scale down if needed).\n"
        "  - All objects must stay inside safe zone: x ∈ [-6, 6], y ∈ [-3.5, 3.5].\n\n"
        f"=== CODE ===\n{state.code}\n\n"
        f"=== ERROR ===\n{state.current_error}"
    )

    response = llm.invoke(prompt)

    # strip_code_fences handles both str and list responses and removes markdown fences
    state.code = strip_code_fences(response.content)

    return state
