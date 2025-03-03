import workers.data_parser as data_parser
import datetime


def parse_new_date(url):
    new_data = data_parser.parse_scores_page(url)
    for data in new_data:
        print(data)
    print("Parsed Games from: ", url)

def convert_date(string):
    split_url = string.split("/")
    epoch_date = datetime.date(1970, 1, 1)
    target_date = datetime.datetime.strptime(split_url[-2], '%Y-%m-%d').date()
    return (target_date - epoch_date).days

parse_new_date('https://plaintextsports.com/mlb/2024-06-07/')
