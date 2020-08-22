# WorkSpaces Icicle Chart

Example of displaying distribution of Amazon WorkSpaces in an Icicle Chart (aka Call Tree) using [D3.js](https://d3js.org/)

## Demo

[https://kyhau.github.io/aws-resource-visualisation/workspaces/icicle_chart/index.html](https://kyhau.github.io/aws-resource-visualisation/workspaces/icicle_chart/index.html)

## Generate data

```
cd workspaces/backend

# Run this script to retrieve WorkSpaces data and output to workspaces.json.
python list_workspaces_connections.py

# Run this script to aggregate data in workspaces.json and output to input_data.json.
python generate_visual_input_data.py
```

## Run locally

1. Copy `index.html` and `input_data.json` to the same folder.

2. Run
<br>Python 3: `python -m http.server 8080`
<br>Python 2: `python -m SimpleHTTPServer 8080`

3. URL: localhost:8080/index.html

## References

1. https://kyhau.github.io/d3-icicle-chart-demo/
2. https://github.com/vasturiano/icicle-chart
