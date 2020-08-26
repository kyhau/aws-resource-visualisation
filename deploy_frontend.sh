BUCKET_NAME="TOO-bucket-name"

pushd network/tangled-tree/frontend
yarn build
popd

aws s3 sync network/directed-graph/ s3://${BUCKET_NAME}/network/directedgraph/

aws s3 sync network/tangled-tree/frontend/build/ s3://${BUCKET_NAME}/network/tangledtree/

aws s3 sync workspaces/icicle_chart/ s3://${BUCKET_NAME}/workspaces/iciclechart/

aws s3 sync workspaces/indented_tree/ s3://${BUCKET_NAME}/workspaces/indentedtree/

aws s3 cp index.html s3://${BUCKET_NAME}/index.html
