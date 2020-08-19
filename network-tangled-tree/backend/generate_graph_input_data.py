import json
from arki_common.file_io import get_json_data_from_file


levels = []

dx_connections = get_json_data_from_file("dx_connections.json")
level_0a = [
    {
        "u_id": v["connectionId"],
        "id": v["connectionId"],
        "name": f'DX Connection {v["connectionName"]}',
        "status": v["connectionState"],
        "details": {
            "Account": v["ownerAccount"],
            "Region": v["region"],
            "Location": v["location"],
            "Bandwidth": v["bandwidth"],
            "JumboFrameCapable": v["jumboFrameCapable"],
            "AwsDevice": v["awsDevice"],
            "AwsDeviceV2": v["awsDeviceV2"],
        },
        "type": "DXC",
        "color": "purple",
        "statusColor": "white" if v["connectionState"] == "available" else "red", # DOWN
    } for v in dx_connections
]
level_0a = sorted(level_0a, key=lambda k: k["name"])
levels.append(level_0a)


vifs = get_json_data_from_file("vifs.json")
level_1a = [
    {
        "u_id": v["virtualInterfaceId"],
        "id": v["virtualInterfaceId"],
        "name": f'{v["virtualInterfaceType"]} VIF {v["virtualInterfaceName"]}',
        "status": v["virtualInterfaceState"],
        "details": {
            "Account": v["ownerAccount"],
            "Region": v["region"],
            "Location": v["location"],
            "AmazonSideAsn": v["amazonSideAsn"],
            "AmazonAddress": v["amazonAddress"],
            "CustomerAddress": v["customerAddress"],
            "AddressFamily": v["addressFamily"],
            "MTU": v["mtu"],
            "JumboFrameCapable": v["jumboFrameCapable"],
            "VLAN": v["vlan"],
            "ASN": v["asn"],
            # TODO more
        },
        "type": "VIF",
        "color": "blue",
        "statusColor": "white" if v["virtualInterfaceState"] == "available" else "red", # DOWN
        "parents": [
            v["connectionId"],
            # TODO virtualGatewayId, directConnectGatewayId
        ],
    } for v in vifs
]
level_1a = sorted(level_1a, key=lambda k: k["parents"][0])
levels.append(level_1a)

################################################################################

vpns = get_json_data_from_file("vpn_connections.json")
level_0b = [
    {
        "u_id": f'{v["CustomerGatewayId"]}-{v["OutsideIpAddress"]}',
        "id": f'{v["CustomerGatewayId"]}-{v["OutsideIpAddress"]}',
        "name": f'CGW {v["Name"]}',
        "status": v["Status"],
        "details": {
            "Account": v["AccountId"],
            "OutsideIpAddress": v["OutsideIpAddress"],
            "TunnelInsideCidr": v["TunnelInsideCidr"],
            "TransitGatewayId": v["TransitGatewayId"],
        },
        "type": "CGW",
        "color": "brown",
        "statusColor": "white" if v["Status"] == "UP" else "red", # DOWN
    } for v in vpns
]
level_0b = sorted(level_0b, key=lambda k: k["details"]["TransitGatewayId"])
levels[0].extend(level_0b)


tgws = get_json_data_from_file("tgws.json")
level_1b = [
    {
        "u_id": v["TransitGatewayId"],
        "id": v["TransitGatewayId"],
        "name": f'TGW {v["Name"]}',
        "status": v["State"],
        "details": {
            "Account": v["OwnerId"],
        },
        "type": "TWG",
        "color": "navy",
        "statusColor": "white" if v["State"] == "available" else "red",
        "parents": [d["id"] for d in level_0b if d["details"]["TransitGatewayId"] == v["TransitGatewayId"]]
    } for v in tgws
]
levels[1].extend(level_1b)


tgw_vpc_attachments = get_json_data_from_file("tgw_vpc_attachments.json")
vpc_tgws = {}
for v in tgw_vpc_attachments:
    vpc_id = v["VpcId"]
    if vpc_id not in vpc_tgws:
        vpc_tgws[vpc_id] = {
            "u_id": vpc_id,
            "id": vpc_id,
            "name": f'VPC ({vpc_id}), {v["Name"]}',
            "status": v["State"],
            "details": {
                "Account": v["VpcOwnerId"],
                "SubnetIds": v["SubnetIds"],
                "Attachments": [
                    f'{v["Name"]} ({v["TransitGatewayAttachmentId"]}, {v["State"]})'
                ],
            },
            "type": "VPC",
            "color": "orange",
            "statusColor": "white" if v["State"] == "available" else "red",
            "parents": [],
        }
    else:
        vpc_tgws[vpc_id]["name"] += f', {v["Name"]}'
        vpc_tgws[vpc_id]["details"]["Attachments"].append(
             f'{v["Name"]} ({v["TransitGatewayAttachmentId"]}, {v["State"]})'
        )

        if v["State"] != vpc_tgws[vpc_id]["status"]:
            vpc_tgws[vpc_id]["statusColor"] = "black"
        vpc_tgws[vpc_id]["status"] = f'{vpc_tgws[vpc_id]["status"]} | {v["State"]}'

    vpc_tgws[vpc_id]["parents"].append(v["TransitGatewayId"])

for k in vpc_tgws.keys():
    vpc_tgws[k]["details"]["SubnetIds"] = json.dumps(vpc_tgws[k]["details"]["SubnetIds"])
    vpc_tgws[k]["details"]["Attachments"] = json.dumps(vpc_tgws[k]["details"]["Attachments"])

level_2b = vpc_tgws.values()
level_2b = sorted(level_2b, key=lambda k: k["details"]["Attachments"])
levels.append(level_2b)


for d in levels:
    print(d)

filename = "../frontend/src/sample_input.json"
with open(filename, "w") as outfile:
        json.dump(levels, outfile, indent=2)
