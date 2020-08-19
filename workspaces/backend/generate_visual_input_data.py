import os
import json
from collections import defaultdict
from datetime import datetime, timedelta
import dateutil.parser
import yaml


def get_json_data_from_file(input_file):
        with open(input_file, "r") as f:
            return json.load(f)


def write_json_file(output_file, data):
    with open(output_file, "w") as outfile:
        json.dump(data, outfile, indent=2, default=str)


def write_yaml_file(output_file, data):
    with open(output_file, "w") as outfile:
        yaml.dump(data, outfile, sort_keys=True)


def generate_visual_input_data(data, account_id):
    tree = {
        "name": account_id,
        "children": [],
    }

    for az in sorted(data.keys()):
        subnets = data[az]
        print(f"  {az} (total_subnets={len(subnets)})")

        az_children = []
        for subnet_id in sorted(subnets.keys()):
            categories = subnets[subnet_id]
            print(f"    {subnet_id} (total_categories={len(categories)})")

            subnet_children = []
            for cat in sorted(categories.keys()):
                workspaces = categories[cat]
                print(f"    {cat} (total_workspaces={len(workspaces)})")

                cat_children = []
                for workspace_id in sorted(workspaces.keys()):
                    cat_children.append({
                        "name": workspace_id,
                        "size": 1
                    })

                subnet_children.append({
                    "name": cat,
                    "children": cat_children
                })

            az_children.append({
                "name": subnet_id,
                "children": subnet_children
                })

        tree["children"].append({
            "name": az,
            "children": az_children
        })

    write_json_file("flare.json", tree)


def main():
    workspaces = get_json_data_from_file("workspaces.json")

    account_id = "todo"
    # account -> region -> az -> subnet -> workspace

    data = defaultdict(dict)
    for w in workspaces:
        az, subnet_id, workspace_id = w["SubnetAvailabilityZone"], w["SubnetId"], w["WorkspaceId"]
        if subnet_id not in data[az]:
            data[az][subnet_id] = {
                "UsedIn24Hrs": {},
                "Inactive": {},
            }

        active = False
        conn_status = w["WorkspacesConnectionStatus"][0]
        if conn_status["ConnectionState"] == "CONNECTED":
            active = True
        else:
            last_dt = conn_status.get("LastKnownUserConnectionTimestamp")
            if last_dt:
                dt = dateutil.parser.parse(last_dt).replace(tzinfo=None)
                past = datetime.now() - timedelta(days=1)
                if dt > past:
                    active = True
                print(f"{workspace_id}, {dt}")

        data[az][subnet_id]["UsedIn24Hrs" if active else "Inactive"].update({workspace_id: w})

    generate_visual_input_data(data, account_id)
    #write_yaml_file("workspaces_report.yaml", tree)
    #print(yaml.dump(data))


if __name__ == "__main__":
    main()
