import DataParser
import League
import datetime


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
    epoch_date = datetime.date(1970, 1, 1)
    target_date = datetime.datetime.strptime(split_url[-2], '%Y-%m-%d').date()
    return (target_date - epoch_date).days

# parse_new_date('https://plaintextsports.com/mlb/2024-06-0' + str(i) + '/')
parse_new_date('https://plaintextsports.com/mlb/2024-06-07/')
