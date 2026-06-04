import modal

render_manim = modal.Function.from_name(
    "agent-manim-renderer",
    "render_manim",
)

code = """
from manim import *

class Hello(Scene):
    def construct(self):
        text = Text("Hello")
        self.play(Write(text))  # This creates an animation, forcing an .mp4 output
"""

video = render_manim.remote(code, "Hello")

print(type(video))
print(len(video))
