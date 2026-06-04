from Langraph.State import AgentState


def route_after_worker(state: AgentState) -> str:
    if state.current_error is None:
        print("🎉 Success — pipeline complete.")
        return "end"

    if state.iteration >= state.max_iterations:
        print(f"🛑 Max iterations ({state.max_iterations}) reached — stopping.")
        return "end"

    if state.error_type in ("syntax", "runtime"):
        print("🔧 Fixable code error — routing to Fix Code node.")
        return "fix"

    if state.error_type == "logic":
        print("🧠 Bad plan / logic issue — routing back to Plan node.")
        return "plan"

    if state.error_type == "env":
        print("⚠️  Environment error — cannot fix at runtime, stopping.")
        return "end"

    return "end"
