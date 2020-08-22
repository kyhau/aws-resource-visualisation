# resource-visualisation

This repo includes some ideas/demo to create visualisation for AWS resources.

## Demo

1. [Network Directed Graph](https://kyhau.github.io/resource-visualisation/network-directed-graph/index.html)
1. Network Tangled Tree (TODO deployed to s3 with static hosting)
1. [Icicle Chart](https://kyhau.github.io/resource-visualisation/workspaces/icicle_chart/index.html)
1. [Indented Tree](https://kyhau.github.io/resource-visualisation/workspaces/indented_tree/index.html)
1. [CloudFormation "graph"](cloudformation-graph/output/frontend.yaml.png)

## Run locally

```
cd <folder>

# python 3
python -m http.server 8080

# python 2
python -m SimpleHTTPServer 8080
```

URL: [localhost:8080/index.html](localhost:8080/index.html)

## Ideas
- Visualisation
    - https://observablehq.com/@d3/mobile-patent-suits
    - https://github.com/erdogant/d3graph
    - https://visjs.github.io/vis-network/examples/
    - https://github.com/aws-samples/amazon-neptune-samples/tree/master/gremlin/visjs-neptune
- https://github.com/aws-samples/amazon-neptune-samples
- https://github.com/tableau/altimeter
