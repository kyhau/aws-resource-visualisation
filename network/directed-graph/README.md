# Network Directed Graph

Example of displaying network data (e.g. VPC Flow Log) in a Disjoint Force-Directed Graph using [D3.js](https://d3js.org/)

## Demo

[https://kyhau.github.io/aws-resource-visualisation/network/directed-graph/index.html](https://kyhau.github.io/aws-resource-visualisation/network/directed-graph/index.html)

## Generate data

```
cd network/directed-graph/backend

# Run this script to retrieve VPC Flow Logs and ENI data and output to input_data.json.
python get_ip_data.py
```

## Run locally

1. Copy `index.html` and `input_data.json` to the same folder.

2. Run
<br>Python 3: `python -m http.server 8080`
<br>Python 2: `python -m SimpleHTTPServer 8080`

3. URL: localhost:8080/network_directed_graph.html

## References
- https://github.com/kyhau/d3-disjoint-force-directed-graph-demo
- https://observablehq.com/@d3/disjoint-force-directed-graph
- https://github.com/Zhenmao/mobile-patent-suits-network-chart
