import os
import json

for filename in os.listdir(r'C:\Individual_Projects\BullpenBudget\src\json'):
   if filename.endswith(".json"):
        file_path = os.path.join('C:\Individual_Projects\BullpenBudget\src\json', filename)
        
        with open(file_path, "r") as file:
            print(json.load(file))