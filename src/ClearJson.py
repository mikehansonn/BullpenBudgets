import os
import json

for filename in os.listdir(r'C:\Individual_Projects\BullpenBudget\src\complete_data'):
   if filename.endswith(".json"):
        file_path = os.path.join(r'C:\Individual_Projects\BullpenBudget\src\complete_data', filename)
        
        with open(file_path, "w") as file:
            file.write("[]")

