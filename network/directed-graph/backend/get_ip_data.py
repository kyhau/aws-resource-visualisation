from botocore.exceptions import ClientError
import boto3
from datetime import datetime, timedelta
import json
import os
import yaml

DEFAULT_LOOKUP_HOURS = 2


def get_tag_value(tags, key):
    k = key.lower()
    for tag in tags:
        if tag["Key"].lower() == k:
            return tag["Value"]


def get_ips_frorm_enis(session):
    ret = {}
    client = session.client("ec2")

    params = {"Filters": [{"Name": "status", "Values": ["in-use"]}]}

    for page in client.get_paginator("describe_network_interfaces").paginate(**params).result_key_iters():
        for i in page:
            attachment_id = i.get("Attachment", {}).get("AttachmentId")
            instance_id = i.get("Attachment", {}).get("InstanceId")

            if instance_id:
                tags = client.describe_tags(Filters=[{"Name": "resource-id", "Values": [instance_id]}])["Tags"]
                name = f"EC2 {get_tag_value(tags, 'Name')} {instance_id}"
            elif i["InterfaceType"] == "transit_gateway":
                name = f"TGW {attachment_id}"
            else:
                name = f"{i['InterfaceType']} {i['Description']}"

            print(f"CheckPt: {name}, {attachment_id}")

            data = {
                "Name": name,
                "Eni": i["NetworkInterfaceId"],
                "IsPrivate": "true",
                "InterfaceType": i["InterfaceType"],
                "SubnetId": i["SubnetId"],
                "VpcId": i["VpcId"],
            }
            ret[i["PrivateIpAddress"]] = data

            public_ip = i.get("Association", {}).get("PublicIp")
            if public_ip:
                ret[i[public_ip]] = data
                ret[i[public_ip]]["IsPrivate"] = "false"

    return ret


def cloudwatch_insights_vpc_flow_logs(session, loggroupname, starttime=None, endtime=None):
    client = session.client("logs")

    end_dt = datetime.now() if endtime is None else datetime.strptime(endtime, "%Y-%m-%d")
    start_dt = end_dt - timedelta(hours=DEFAULT_LOOKUP_HOURS) if starttime is None else datetime.strptime(starttime, "%Y-%m-%d")
    query_string = "fields @timestamp, @message | sort @timestamp desc"

    flows = {}

    query_id = client.start_query(
        logGroupName=loggroupname,
        startTime=int(start_dt.timestamp()),
        endTime=int(end_dt.timestamp()),
        queryString=query_string,
    )["queryId"]

    status = "Running"    # 'Scheduled'|'Running'|'Complete'|'Failed'|'Cancelled'
    while status == "Running":
        response = client.get_query_results(queryId=query_id)
        for item in response.get("results", []):
            v = [k["value"] for k in item if k["field"] == "@message"][0]

            # https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html#flow-log-records
            # <version> <account-id> <interface-id> <srcaddr> <dstaddr> <srcport> <dstport> <protocol> <packets> <bytes> <start> <end> <action> <log-status>
            #t = [k["value"] for k in item if k["field"] == "@timestamp"][0]
            flow_data = v.split(" ")

            src = flow_data[3]
            dest = flow_data[4]

            if (src, dest) not in flows:
                flows[(src, dest)] = {
                    "Eni": flow_data[2],
                    "SrcPort": flow_data[5],
                    "DstPort": flow_data[6],
                    "Protocol": flow_data[7],
                    "Action": flow_data[12],
                }

        status = response.get("status")
    return flows


def main():
    from boto3.session import Session

    profile_name = "TODO"
    log_group_name = "TODO"

    session = Session(profile_name=profile_name)

    flows = cloudwatch_insights_vpc_flow_logs(session, loggroupname=log_group_name)

    ip_dict = get_ips_frorm_enis(session)

    ip_links = [
        {
            "source": f"{s} {ip_dict[s]['Name']}" if s in ip_dict else s,
            "target": f"{d} {ip_dict[d]['Name']}" if d in ip_dict else d,
            "type": "accepted" if v["Action"] == "ACCEPT" else "rejected",
        } for (s, d), v in flows.items()
        if s in ip_dict and d in ip_dict
        and (ip_dict[s]['InterfaceType'] != "transit_gateway" and ip_dict[d]['InterfaceType'] != "transit_gateway" )
    ]

    with open("input_data.json", "w") as write_file:
        json.dump(ip_links, write_file, indent=2)


if __name__ == "__main__":
     main()
