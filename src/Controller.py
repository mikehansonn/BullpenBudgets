import DataParser
import League


def parse_new_date(url):
    new_data = DataParser.parse_scores_page(url)
    league = League.League()
    league.read_teams()
    league.read_new_data(new_data)
    league.write_teams()
    print("Parsed Games from: ", url)

def sum_data():
    league = League.League()
    league.read_team()


parse_new_date('https://plaintextsports.com/mlb/2023-09-21/')
parse_new_date('https://plaintextsports.com/mlb/2023-09-22/')
parse_new_date('https://plaintextsports.com/mlb/2023-09-23/')
# parse_new_date('https://plaintextsports.com/mlb/2023-09-24/')
# parse_new_date('https://plaintextsports.com/mlb/2023-09-25/')
# parse_new_date('https://plaintextsports.com/mlb/2023-09-26/')
# parse_new_date('https://plaintextsports.com/mlb/2023-09-27/')
