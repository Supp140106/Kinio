import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from Langraph.Agent import graph

png_data = graph.get_graph().draw_mermaid_png()
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agent_graph.png")
with open(output_path, "wb") as f:
    f.write(png_data)

print(f"Agent graph saved to: {output_path}")
