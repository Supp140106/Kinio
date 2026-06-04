import modal

manim_image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install(
        "ffmpeg",
        "libcairo2-dev",
        "libpango1.0-dev",
        "pkg-config",
        "python3-dev",
        "texlive",
        "texlive-latex-extra",
        "texlive-fonts-recommended",
        "texlive-fonts-extra",  # ← add
        "texlive-science",  # ← add
        "dvipng",
        "cm-super",
        "dvisvgm",  # ← add
    )
    .pip_install("manim==0.18.1", "numpy>=1.26,<2.0")  # ← pin versions
)

app = modal.App("agent-manim-renderer", image=manim_image)
