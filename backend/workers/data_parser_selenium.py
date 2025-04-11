from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import re
import time

def get_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def grab_team_name(div_text):
    match = re.search(r'<b>(.*?)\s+Pitching', div_text)
    if match:
        return match.group(1).lower().replace(" ", "-")
    return ""

def string_to_formated_list(div_html):
    splits = div_html.split('</div>')
    team = grab_team_name(splits[0])
    splits = splits[1:-2]
    print(splits)
    return_list = []
    i = 0

    while i < len(splits):
        rl = {}

        name_match = re.search(r'<div>(.*?)<span', splits[i])
        if name_match:
            name = name_match.group(1).strip()
        else:
            # Skip if we can't find the name
            i += 2
            continue

        if i + 1 < len(splits):
            stat_line = re.sub(r'<[^>]+>', '', splits[i + 1]).strip()
            stat_split = stat_line.split()
            
            if stat_split and stat_split[0].startswith('<'):
                stat_split.pop(0)
                
            if len(stat_split) >= 9:
                dict_stat_split = {
                    "IP": stat_split[0],
                    "H": stat_split[1],
                    "R": stat_split[2],
                    "ER": stat_split[3],
                    "BB": stat_split[4],
                    "K": stat_split[5],
                    "HR": stat_split[6],
                    "P": stat_split[7],
                    "ERA": stat_split[8]
                }
                rl["name"] = name
                rl["team"] = team
                rl["outing"] = dict_stat_split
                return_list.append(rl)
                
        i += 2

    return return_list

def parse_box_score(url):
    driver = get_driver()
    new_data = []
    
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 10)
        box_scores = wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "box-score-players")))
        for item in box_scores:
            html_content = item.get_attribute('outerHTML')
            if 'Pitching' in html_content:
                splits = string_to_formated_list(html_content)
                new_data.extend(splits)
                
    except TimeoutException:
        print(f"Timeout waiting for box scores to load at {url}")
    except Exception as e:
        print(f"Error parsing box score at {url}: {str(e)}")
    finally:
        driver.quit()
    
    return new_data

def parse_scores_page(url):
    driver = get_driver()
    new_data = []
    start_url = "https://plaintextsports.com"
    
    try:
        driver.get(url)
        time.sleep(3)
        
        wait = WebDriverWait(driver, 10)
        team_links = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a.text-fg.no-underline")))
        hrefs = [link.get_attribute('href') for link in team_links]
        driver.quit()
        
        for href in hrefs:
            if href:
                new_data.extend(parse_box_score(href))
                time.sleep(1)
                
    except TimeoutException:
        print(f"Timeout waiting for team links to load at {url}")
    except Exception as e:
        print(f"Error parsing scores page at {url}: {str(e)}")
    finally:
        if driver:
            driver.quit()
    
    return new_data