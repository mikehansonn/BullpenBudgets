import json
import Player as ply
from datetime import datetime

class Team:
    def __init__(self, filename, players):
        self.filename = filename
        self.players = self.read_players(players)


    def read_players(self, players):
        team_players = []
        # split = players.split('\n')
        for player in players:
            new_player = ply.Player(player['name'], player['all_outings'])
            team_players.append(new_player)

        return team_players
    

    def write_players(self):
        full_write = []

        with open(self.filename, 'w') as file:
            for player in self.players:
                full_write.append(player.json_object())
            json.dump(full_write, file)
            
    def read_new_data(self, new_stats):
        print("new team")
        current_date = datetime.now()
        current_ordinal_date = current_date.toordinal()

        # Check the starter exception
        for i in range(len(self.players)):
            if new_stats[0][0] == self.players[i].name:
                self.players[i].add_outing([new_stats[0][1], current_ordinal_date])
                found = True

        for combo in new_stats[1:]:
            found = False
            for i in range(len(self.players)):
                if combo[0] == self.players[i].name:
                    self.players[i].add_outing([combo[1], current_ordinal_date])
                    found = True
            if not found:
                new_player = ply.Player(combo[0], [])
                new_player.add_outing([combo[1], current_ordinal_date])
                self.players.append(new_player)

    
