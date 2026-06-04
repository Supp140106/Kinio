from Langraph.State import AgentState


def detect_mode(state: AgentState) -> AgentState:
    """Detects whether this is a fresh generation or an edit of existing code."""
    state.is_edit_request = bool(state.previous_code)
    return state
