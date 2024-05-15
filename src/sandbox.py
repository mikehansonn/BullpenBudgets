import os
import json
from datetime import datetime as dt

def json_test():
    for filename in os.listdir(r'C:\Individual_Projects\BullpenBudget\src\json'):
        if filename.endswith(".json"):
                file_path = os.path.join('C:\Individual_Projects\BullpenBudget\src\json', filename)
                
                with open(file_path, "r") as file:
                    print(json.load(file))


string = "https://plaintextsports.com/mlb/2024-04-22/"
split_url = string.split("/")
ordinal = dt.strptime(split_url[-2], '%Y-%m-%d').date()