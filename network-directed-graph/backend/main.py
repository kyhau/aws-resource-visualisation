from boto3.session import Session
import boto3
import logging

logging.getLogger().setLevel(logging.DEBUG)
logging.getLogger('botocore').setLevel(logging.CRITICAL)
logging.getLogger('boto3').setLevel(logging.CRITICAL)
logging.getLogger('urllib3.connectionpool').setLevel(logging.CRITICAL)
logging.info(f'boto3.__version__: {boto3.__version__}')



def get_all_network_interfaces():
    session = Session(profile_name="default")
    client = session.client("ec2")
 
    params = {}
    for page in client.get_paginator('describe_network_interfaces').paginate(**params).result_key_iters():
        for i in page:
            data = {
                'PrivateIpAddress': str(i.get('PrivateIpAddress', ' ')),
                'PublicIp': str(i.get('Association', {}).get('PublicIp', ' ')),
                'Status': str(i.get('Status', ' ')),
                'AttStatus': str(i.get('Attachment', {}).get('Status', ' ')),
                'InterfaceType': str(i.get('InterfaceType', ' ')),
            }
            print(data)


def main():
    get_all_network_interfaces()


if __name__ == '__main__':
     main()
