from Langraph.State import AgentState
from LLM.openai import llm

PLAN_RULES = """
Manim Animation Planning Rules:

GOAL:
Break the user request into a clear, structured animation plan.
Focus ONLY on "what happens" — never on implementation details or code.

════════════════════════════════
OUTPUT FORMAT (STRICT — all 6 sections required)
════════════════════════════════

1. Scene Overview
   - One sentence describing the animation.

2. Objects
   - List every visual element (shapes, axes, curves, dots, text labels, etc.).
   - For EVERY text label write the EXACT short string to display — max 35 characters per label.
   - Keep simultaneous on-screen objects to 6 or fewer.

3. Layout & Composition  ← REQUIRED
   - State WHERE each object lives on screen using simple directions:
       "top-centre", "bottom-centre", "centre", "left of centre", "right of centre",
       "below the axes", "above the curve", etc.
   - Ensure NO two objects overlap unless the overlap is intentional.
   - If several text items appear at once, stack them vertically with clear spacing.
   - Example:
       • Title            → top-centre
       • Axes             → centre, shifted slightly downward to clear the title
       • Formula label    → directly below the axes
       • Animated dot     → on the curve, moves left to right

4. Animation Steps (ordered)
   - Step-by-step sequence of visible changes.
   - Each step = one distinct visible action (appear, move, transform, disappear).
   - Include a brief self.wait pause between major steps.
   - End with a clean FadeOut of all remaining objects.

5. Motion Logic (if applicable)
   - Describe continuous movement conceptually.
   - Example: "a dot glides along the sine curve from left to right"
   - Do NOT mention any API names, classes, or code constructs.

6. Optional Enhancements
   - Clearly mark every item as (OPTIONAL).

════════════════════════════════
RULES
════════════════════════════════
- DO NOT write any code.
- DO NOT mention Python, Manim, ValueTracker, np.sin, or any API / library.
- Text labels must be short: ≤ 35 characters. Use a shortened form if needed.
  GOOD: "y = sin(x)"         BAD: "This graph shows the sine of x plotted from -3 to 3"
  GOOD: "Position vs Time"   BAD: "A chart showing how position changes over time"
- Do NOT plan more than 6 objects visible on screen at the same time.
- Every object MUST have an explicit screen position in Section 3.
- The plan must be directly convertible into clean, well-laid-out Manim code.

Your job is to think like a storyboard designer — not a programmer.
"""


def plan_node(state: AgentState) -> AgentState:
    if state.is_edit_request:
        prompt = (
            f"{PLAN_RULES}\n\n"
            "Modify the existing animation plan based on the user request.\n\n"
            f"Existing Plan:\n{state.previous_plan}\n\n"
            f"User Request:\n{state.prompt}\n\n"
            "Output the UPDATED PLAN only (all 6 sections). Mark changed parts with [UPDATED]."
        )
    else:
        prompt = (
            f"{PLAN_RULES}\n\n"
            "Create a step-by-step Manim animation plan for the request below.\n\n"
            f"User Prompt:\n{state.prompt}\n\n"
            "Output the PLAN only (all 6 sections). Mark optional steps as (OPTIONAL)."
        )

    response = llm.invoke(prompt)

    if hasattr(response, "content"):
        content = response.content
        if isinstance(content, str):
            state.plan = content
        elif isinstance(content, list):
            state.plan = "\n".join(str(item) for item in content)
        else:
            state.plan = str(content)
    else:
        state.plan = str(response) if response else None

    return state
