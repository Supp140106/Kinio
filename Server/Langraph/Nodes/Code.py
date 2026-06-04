import ast
import re
from typing import Any, Union

from Langraph.State import AgentState
from LLM.openai import llm


def extract_string_content(content: Any) -> str:
    """Safely extract string from various response content types."""
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        return "\n".join(str(item) for item in content)
    else:
        return str(content)


def strip_code_fences(text: Union[str, list, Any]) -> str:
    """Strip markdown code fences (handles str, list, or any type)."""
    text_str = extract_string_content(text).strip()
    fenced = re.search(r"```[a-zA-Z]*\n(.*?)```", text_str, re.DOTALL)
    if fenced:
        return fenced.group(1).strip()
    text_str = re.sub(r"^```[a-zA-Z]*\s*\n?", "", text_str)
    text_str = re.sub(r"\n?```\s*$", "", text_str)
    return text_str.strip()


MANIM_RULES = """
Manim Code Generation Rules

════════════════════════════════════════
OUTPUT
════════════════════════════════════════
- Output ONLY valid Python code — no markdown fences, no explanations.
- Exactly ONE class that subclasses Scene, with a construct() method.
- Always start with: from manim import *

════════════════════════════════════════
SCENE DIMENSIONS  ← CRITICAL
════════════════════════════════════════
Default frame:  14.22 units wide  ×  8.0 units tall
  x-axis:  -7.1  →  +7.1      (centre = 0)
  y-axis:  -4.0  →  +4.0      (centre = 0)

SAFE ZONE — every object MUST stay inside:
  x: -6.0  to  +6.0
  y: -3.5  to  +3.5

════════════════════════════════════════
TEXT RULES  ← Most common cause of cut-off / overflow
════════════════════════════════════════
Font sizes:
  title      → font_size=40
  heading    → font_size=32
  body text  → font_size=28
  caption / axis label → font_size=22

Character limit: max ~35 characters per line.
  Split longer strings with \\n:
    Text("Line one\\nLine two", font_size=28)

After creating ANY Text / MathTex / Tex object, guard its width:
    label = Text("...", font_size=28)
    if label.width > 11:
        label.scale(11 / label.width)

NEVER put a long sentence in a single Text() on one line.

════════════════════════════════════════
LAYOUT & POSITIONING RULES
════════════════════════════════════════
Default placement:
  • Title            → .to_edge(UP)              or .shift(UP * 3.2)
  • Main content     → .move_to(ORIGIN)           (centred)
  • Axes with title  → .shift(DOWN * 0.4)         (nudge down to clear title)
  • Formula / caption → .next_to(main_obj, DOWN, buff=0.35)
  • Bottom label     → .to_edge(DOWN)

Positioning helpers — use ONLY these, never raw coordinates:
  ✅ obj.move_to(ORIGIN)
  ✅ obj.to_edge(UP)   obj.to_edge(DOWN)
  ✅ obj.shift(UP * 2)   obj.shift(DOWN * 0.5 + LEFT * 1)
  ✅ obj.next_to(other, DOWN, buff=0.4)
  ✅ obj.to_corner(UL)
  ❌ obj.move_to(np.array([2.3, -1.7, 0]))   # hard-coded magic numbers — NEVER

Grouping with VGroup:
  group = VGroup(a, b, c).arrange(DOWN, buff=0.4).move_to(ORIGIN)
  Do NOT stack more than 5 items vertically without scaling the group.
  After arranging, confirm group.height < 7 — scale down if needed:
    if group.height > 7:
        group.scale(7 / group.height)

════════════════════════════════════════
ANIMATION RULES
════════════════════════════════════════
- Use ValueTracker for all continuous motion (NEVER self.time).
- Use np.sin / np.cos  (NEVER math.sin / math.cos).
- Clamp in point_from_proportion:  np.clip(tracker.get_value(), 0, 1)
- run_time: 1–3 s per step; add self.wait(0.5) between major stages.
- Always call obj.clear_updaters() right after updater-based animations.
- End every scene with FadeOut of ALL remaining objects.

════════════════════════════════════════
QUALITY CHECKLIST  (verify before outputting code)
════════════════════════════════════════
□ Every Text/MathTex is width-guarded (scale to fit ≤ 11 units)
□ No object outside safe zone  x ∈ [-6, 6], y ∈ [-3.5, 3.5]
□ Title is at the top; main content is centred
□ No unintentional overlaps between objects
□ All updaters cleared after animation
□ Scene ends with FadeOut of everything
□ Code runs without modification: manim -ql scene.py ClassName
"""

MANIM_EXAMPLE = """
# ── REFERENCE EXAMPLE — follow this style exactly ───────────────────────────
from manim import *

class SineWaveScene(Scene):
    def construct(self):
        # ── Title — anchored to top edge ──────────────────────────────────
        title = Text("Sine Wave", font_size=40).to_edge(UP)
        self.play(Write(title), run_time=1)

        # ── Axes — centred, nudged down so the title does not overlap ─────
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-2, 2, 1],
            x_length=10,
            y_length=5,
            axis_config={"include_numbers": True, "font_size": 22},
        ).shift(DOWN * 0.4)

        axis_labels = axes.get_axis_labels(
            x_label=Text("x", font_size=22),
            y_label=Text("y", font_size=22),
        )
        self.play(Create(axes), Write(axis_labels), run_time=2)

        # ── Curve ─────────────────────────────────────────────────────────
        curve = axes.plot(np.sin, color=BLUE, x_range=[-3, 3])
        # Caption below axes — width-guarded
        caption = Text("y = sin(x)", font_size=26).next_to(axes, DOWN, buff=0.3)
        if caption.width > 11:
            caption.scale(11 / caption.width)

        self.play(Create(curve), Write(caption), run_time=2)
        self.wait(0.5)

        # ── Animated dot along the curve ──────────────────────────────────
        tracker = ValueTracker(0)
        dot = Dot(color=RED)
        dot.move_to(curve.point_from_proportion(0))
        dot.add_updater(
            lambda d: d.move_to(
                curve.point_from_proportion(np.clip(tracker.get_value(), 0, 1))
            )
        )
        self.add(dot)
        self.play(tracker.animate.set_value(1), run_time=4)
        dot.clear_updaters()

        self.wait(1)
        self.play(FadeOut(title, axes, axis_labels, curve, caption, dot))
# ─────────────────────────────────────────────────────────────────────────────
"""

KNOWN_BAD_PATTERNS = [
    ("self.time", "self.time does not exist — use ValueTracker"),
    ("math.sin", "use np.sin instead of math.sin"),
    ("math.cos", "use np.cos instead of math.cos"),
    ("math.pi", "use PI or np.pi instead of math.pi"),
    ("math.sqrt", "use np.sqrt instead of math.sqrt"),
]


def lint_manim_code(code: str) -> list[str]:
    """Check for known bad patterns."""
    return [f"⚠️ Found '{pat}': {msg}" for pat, msg in KNOWN_BAD_PATTERNS if pat in code]


def lint_text_overflow(code: str) -> list[str]:
    """Warn when a Text() call has a string longer than 40 chars on one line (overflow risk)."""
    issues = []
    # Match Text("...") or Text('...')  — single-line strings only
    for match in re.finditer(r'Text\(["\']([^"\'\\]{40,})["\']', code):
        s = match.group(1)
        issues.append(
            f"⚠️ Text string is {len(s)} chars and may overflow the frame: "
            f'"{s[:40]}…"  — split with \\n or shorten to ≤35 chars per line'
        )
    return issues


def validate_python_syntax(code: str) -> tuple[bool, str]:
    try:
        ast.parse(code)
        return True, ""
    except SyntaxError as e:
        return False, f"SyntaxError at line {e.lineno}: {e.msg}"


def code_node(state: AgentState) -> AgentState:
    max_retries = 3
    error_feedback = ""

    for attempt in range(1, max_retries + 1):
        base_prompt = MANIM_RULES + "\n" + MANIM_EXAMPLE

        if state.is_edit_request:
            prompt = (
                f"{base_prompt}\n\n"
                "Modify the existing Manim code according to the updated plan.\n"
                "Preserve all layout rules from the rules above.\n\n"
                f"Existing Code:\n{state.previous_code}\n\n"
                f"Updated Plan:\n{state.plan}"
            )
        else:
            prompt = (
                f"{base_prompt}\n\n"
                "Convert the plan below into complete, runnable Manim Python code.\n"
                "Follow ALL layout, text, and safe-zone rules above precisely.\n\n"
                f"Plan:\n{state.plan}"
            )

        if error_feedback:
            prompt += f"\n\nFix these issues from your last attempt:\n{error_feedback}"

        response = llm.invoke(prompt)

        code = strip_code_fences(
            response.content if hasattr(response, "content") else str(response)
        )

        # ── Validation ────────────────────────────────────────────────────
        is_valid, syntax_err = validate_python_syntax(code)
        if not is_valid:
            error_feedback = syntax_err
            print(f"❌ Attempt {attempt} — Syntax error: {syntax_err}")
            continue

        issues = lint_manim_code(code) + lint_text_overflow(code)
        if issues:
            error_feedback = "\n".join(issues)
            print(f"❌ Attempt {attempt} — Lint issues:\n{error_feedback}")
            continue

        print(f"✅ Attempt {attempt} — Code passed all checks.")
        state.code = code
        return state

    raise ValueError(
        f"Code generation failed after {max_retries} attempts.\nLast error:\n{error_feedback}"
    )
