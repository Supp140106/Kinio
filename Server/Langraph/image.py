from IPython.display import Image, display

from Langraph.Agent import graph

display(Image(graph.get_graph().draw_mermaid_png()))
