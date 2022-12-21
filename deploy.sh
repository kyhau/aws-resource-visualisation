BUCKET_APP="TODO-app-bucket-name"
BUCKET_LOG="TODO-log-bucket-name"


echo "Deploying CloudFront"

aws cloudformation deploy --template-file cfn/frontend.yaml \
  --stack-name my-new-stack \
  --parameter-overrides \
    AppBucketName=${BUCKET_APP} \
    KLogsBucketName=${BUCKET_LOG}


echo "Uploading content to S3"

pushd network/tangled-tree/frontend
yarn build
popd

aws s3 sync network/directed-graph/ s3://${BUCKET_NAME}/network/directedgraph/

aws s3 sync network/tangled-tree/frontend/build/ s3://${BUCKET_NAME}/network/tangledtree/

aws s3 sync workspaces/icicle_chart/ s3://${BUCKET_NAME}/workspaces/iciclechart/

aws s3 sync workspaces/indented_tree/ s3://${BUCKET_NAME}/workspaces/indentedtree/

aws s3 cp index.html s3://${BUCKET_NAME}/index.html
