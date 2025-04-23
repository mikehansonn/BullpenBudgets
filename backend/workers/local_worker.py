from datetime import datetime, timedelta
from db import get_database
import data_parser as data_parser
import re

async def update_player_data(player_data, date_str):
    db = get_database()
    players_collection = db.tplayers
    
    # Format the date
    outing_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    
    # Add date to the outing data
    player_data['outing']['date'] = outing_date.isoformat()
    
    # Check if player already exists
    player_name = player_data['name']
    team = player_data['team']
    current_outing = player_data['outing']
    
    existing_player = await players_collection.find_one({"name": player_name})
    
    if existing_player:
        # Update existing player
        update_data = {
            "$set": {"team": team},
            "$push": {"outings": current_outing}
        }
        await players_collection.update_one({"_id": existing_player["_id"]}, update_data)
        print(f"Updated player: {player_name}")
    else:
        # Create new player entry
        new_player = {
            "name": player_name,
            "team": team,
            "outings": [current_outing],
        }
        await players_collection.insert_one(new_player)
        print(f"Added new player: {player_name}")


async def process_mlb_data(url):
    # Extract date from URL
    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', url)
    if not date_match:
        raise ValueError(f"Invalid URL format: {url}. Expected format: https://plaintextsports.com/mlb/YYYY-MM-DD/")
    
    date_str = date_match.group(1)
    
    # Use the Selenium parser to get data
    # This is a synchronous function so we don't need to await it
    player_data_list = data_parser.parse_scores_page(url)
    
    # Process each player's data
    for player_data in player_data_list:
        await update_player_data(player_data, date_str)
    
    print(f"Completed processing {len(player_data_list)} player records for {date_str}")


async def worker_main():
    start_date = datetime(2025, 4, 22)
    for i in range(1):
        date_str = start_date.strftime('%Y-%m-%d')
        url = f'https://plaintextsports.com/mlb/{date_str}/'
        await process_mlb_data(url)
        print(f"Successfully processed MLB data for {date_str}")
        start_date = start_date + timedelta(days=1)


if __name__ == "__main__":
    import asyncio

    asyncio.run(worker_main())