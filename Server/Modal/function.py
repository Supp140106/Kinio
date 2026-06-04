import re

from Modal.Setup import app


def extract_scene_class(code: str) -> str:
    match = re.search(r"class\s+(\w+)\s*\(Scene\)", code)
    if not match:
        raise ValueError("No Scene subclass found in generated code.")
    return match.group(1)


@app.function(timeout=300)
def render_manim(scene_code: str, scene_class: str) -> bytes:
    import os
    import subprocess
    import sys
    import tempfile

    with tempfile.TemporaryDirectory() as tmpdir:
        scene_file = os.path.join(tmpdir, "scene.py")
        with open(scene_file, "w") as f:
            f.write(scene_code)

        result = subprocess.run(
            [
                sys.executable,
                "-m",
                "manim",
                "-ql",
                "--output_file",
                "output",
                "--media_dir",
                tmpdir,
                scene_file,
                scene_class,  # ← explicit class name
            ],
            capture_output=True,
            text=True,
            cwd=tmpdir,
        )

        if result.returncode != 0:
            raise RuntimeError(result.stderr)

        for root, _, files in os.walk(tmpdir):
            for file in files:
                if file.endswith(".mp4"):
                    with open(os.path.join(root, file), "rb") as f:
                        return f.read()

        raise FileNotFoundError("No .mp4 found after render.")
