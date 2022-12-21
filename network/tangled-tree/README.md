# Network Tangled Tree

- [![build-tangled-tree](https://github.com/kyhau/aws-resource-visualisation/actions/workflows/build-tangled-tree.yaml/badge.svg)](https://github.com/kyhau/aws-resource-visualisation/actions/workflows/build-tangled-tree.yaml)

Example of displaying network data in a Tangled Tree using [D3.js](https://d3js.org/)

The backend code currently supported:
1. DX <-- dx_connection --> VIF (public)
1. CGW <-- vpn_connection --> TGW
1. TGW <-- tgw_vpc_attachment --> VPC

## Demo

(TODO deploy to s3 with static hosting)

[https://kyhau.github.io/aws-resource-visualisation/network/tangled-tree/index.html](https://kyhau.github.io/aws-resource-visualisation/network/tangled-tree/index.html)


## Generate data

```
cd network/tangled-tree/backend

# Run this script to call aws apis to retrieve some network data and output to data/.
python list_dx_vpn_tgw_vgw_connections.py

# Run this script to aggregate data in data/ and output to frontend/src/input_data.json.
python generate_graph_input_data.py
```

## Run frontend locally

```
cd network/tangled-tree/frontend
yarn
yarn start
```

## Build frontend with input_data.json for deployment
```
yarn build
```

## Deploy to S3 with static hosting
Use [deploy.sh](../../deploy.sh) to deploy to S3.

## References
Frontend React app is a modified version of the following
- https://dev.to/nitinreddy3/tangled-tree-with-d3-and-react-5g25
- https://observablehq.com/@nitaku/tangled-tree-visualization-ii
