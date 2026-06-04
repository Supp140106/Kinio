# ── Build the graph ─────────────────────────────────────────────────────────
from langgraph.graph import END, START, StateGraph

from Langraph.Nodes.Code import code_node
from Langraph.Nodes.Detect import detect_mode
from Langraph.Nodes.Fix import fix_node
from Langraph.Nodes.Plan import plan_node
from Langraph.Nodes.Router import route_after_worker
from Langraph.Nodes.Worker import render_video_node
from Langraph.State import AgentState

workflow = StateGraph(AgentState)


workflow.add_node("detect_mode", detect_mode)
workflow.add_node("plan", plan_node)
workflow.add_node("code", code_node)
workflow.add_node("render", render_video_node)
workflow.add_node("fix", fix_node)


workflow.add_edge(START, "detect_mode")
workflow.add_edge("detect_mode", "plan")
workflow.add_edge("plan", "code")
workflow.add_edge("code", "render")


workflow.add_conditional_edges(
    "render",
    route_after_worker,
    {
        "end": END,
        "fix": "fix",
        "plan": "plan",
    },
)


workflow.add_edge("fix", "render")

graph = workflow.compile()
