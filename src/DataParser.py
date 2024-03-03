import requests
import re
from bs4 import BeautifulSoup

def grab_team_name(div):
    start_index = div.find('<b>') + 3
    end_index = div.find('Pitching') - 1
    return div[start_index:end_index].lower().replace(" ", "-")

def string_to_formated_list(string):
    splits = str(string).split('</div>')
    team = splits.pop(0)
    splits = splits[:-2]
    return_list = [grab_team_name(team)]
    i = 0

    while i < len(splits):
        rl = []

        # Get Pitcher Name
        start_index = splits[i].find('<div>') + 5
        end_index = splits[i].find('<span') - 1
        name = splits[i][start_index:end_index].strip()
        rl.append(name)

        # Extract pitch count
        stat_split = splits[i + 1].split()
        rl.append(stat_split[-2])
        return_list.append(rl)
        i += 2

    return return_list


def parse_box_score(url):
    response = requests.get(url, allow_redirects=True)
    soup = BeautifulSoup(response.content, 'html.parser')
    game_items = soup.find_all('div', class_='box-score-players')
    new_data = []

    for item in game_items:
        if 'Pitching' in str(item):
            splits = string_to_formated_list(item)
            new_data.append(splits)
    
    return new_data


def parse_scores_page(url):
    start_url = "https://plaintextsports.com"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    teams = soup.find_all('a', class_='text-fg no-underline')
    new_data = []

    for team in teams:
        new_data.extend(parse_box_score(start_url + team['href']))
    
    return new_data

