import DataParser
import League
from datetime import datetime as dt


def parse_new_date(url):
    new_data = DataParser.parse_scores_page(url)
    league = League.League(convert_date(url))
    league.read_teams(convert_date(url))
    league.read_new_data(new_data)
    league.write_teams()
    print("Parsed Games from: ", url)

def sum_data():
    league = League.League()
    league.read_team()

def convert_date(string):
    split_url = string.split("/")
    ordinal = dt.strptime(split_url[-2], '%Y-%m-%d').date()
    return ordinal.toordinal()


for i in range(8):
    parse_new_date('https://plaintextsports.com/mlb/2024-04-1' + str(i) + '/')
