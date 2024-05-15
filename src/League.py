import Team
import os
import json

class League:
    def __init__(self, ordinal):
        self.teams = {}
        self.read_teams(ordinal)

    
    def read_teams(self, ordinal):
        for filename in os.listdir(r'C:\Individual_Projects\BullpenBudget\src\complete_data'):
            if filename.endswith(".json"):
                file_path = os.path.join('C:\Individual_Projects\BullpenBudget\src\complete_data', filename)
                
                with open(file_path, "r") as file:
                    new_data = json.load(file)
                    new_team = Team.Team(file_path, new_data, ordinal)
                    self.teams[filename] = new_team

    
    def write_teams(self):
        for key, value in self.teams.items():
            value.write_players()


    def read_new_data(self, stats):
        for new_data in stats:
            filename = new_data[0] + '.json'
            value = self.teams[filename]
            value.read_new_data(new_data[1:])
            self.teams[filename] = value
