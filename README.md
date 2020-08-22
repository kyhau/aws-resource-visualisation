# aws-resource-visualisation

This repo includes tools/scripts to create simple visualisation for some AWS resources.

## Scripts and Demo Links

1. [CloudFormation "graph"](cloudformation-graph/)
   ([Demo](cloudformation-graph/output/frontend.yaml.png))
   <br>A script that builds a DOT graph from a CloudFormation template then exports it as a .png image.
1. [Network Directed Graph](network/directed-graph/)
   ([Demo](https://kyhau.github.io/aws-resource-visualisation/network/directed-graph/index.html))
   <br>An example of displaying network data (e.g. VPC Flow Log) in a Disjoint Force-Directed Graph.
1. [Network Tangled Tree](network/tangled-tree/)
   (Demo TODO deploy to s3 with static hosting)
   <br>An example of displaying network data (e.g. DX, VIF, CGW, TGW, VPC) in a Tangled Tree.
1. [WorkSpaces Icicle Chart](workspaces/icicle_chart/)
   ([Demo](https://kyhau.github.io/aws-resource-visualisation/workspaces/icicle_chart/index.html))
   <br>An example of displaying distribution of Amazon WorkSpaces in an Icicle Chart (aka Call Tree).
1. [WorkSpaces Indented Tree](workspaces/indented_tree/)
   ([Demo](https://kyhau.github.io/aws-resource-visualisation/workspaces/indented_tree/index.html))
   <br>An example of displaying distribution of Amazon WorkSpaces in an Indented Tree.
1. [Collapsible tree](https://github.com/kyhau/d3-collapsible-tree-demo)
   ([Demo](https://kyhau.github.io/d3-collapsible-tree-demo/collapsible_tree.html))
   <br>An example of displaying data in a collapsible tree.


## Common Infrastructure

1. [cloudformation](cloudformation/) - CloudFormation templates for creating a static website backed by an S3 bucket and served via https througg CloudFront with OAI.
2. [deploy_frontend.sh](deploy_frontend.sh) - Upload content and assets to S3.


## Other Ideas

- Visualisation
    - https://observablehq.com/@d3/mobile-patent-suits
    - https://github.com/erdogant/d3graph
    - https://visjs.github.io/vis-network/examples/
    - https://github.com/aws-samples/amazon-neptune-samples/tree/master/gremlin/visjs-neptune
- https://github.com/aws-samples/amazon-neptune-samples
- https://github.com/tableau/altimeter
