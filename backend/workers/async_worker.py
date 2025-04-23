import asyncio
from datetime import datetime
from workers.db import get_database
import workers.data_parser_selenium as data_parser
import re

async def update_player_data(player_data, date_str):
    db = get_database()
    players_collection = db.players
    
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
        date_exists = False
        if "outings" in existing_player:
            for outing in existing_player["outings"]:
                if "date" in outing and outing["date"] == current_outing["date"]:
                    date_exists = True
                    break
        
        if not date_exists:
            update_data = {
                "$set": {"team": team},
                "$push": {"outings": current_outing}
            }
            await players_collection.update_one({"_id": existing_player["_id"]}, update_data)
            print(f"Updated player: {player_name}")
        else:
            print(f"Skipped player {player_name} - outing for {current_outing['date']} already exists")
    else:
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
    
    # Use the controller to parse data
    # We'll modify this to be async-friendly
    player_data_list = data_parser.parse_scores_page(url)
    
    # Process each player's data
    tasks = []
    for player_data in player_data_list:
        task = update_player_data(player_data, date_str)
        tasks.append(task)
    
    # Wait for all updates to complete
    await asyncio.gather(*tasks)
    
    print(f"Completed processing {len(player_data_list)} player records for {date_str}")


async def worker_main():
    from datetime import date, timedelta
    
    today = date.today() - timedelta(days=1)
    date_str = today.strftime('%Y-%m-%d')
    
    # Construct URL for today
    url = f'https://plaintextsports.com/mlb/{date_str}/'
    
    await process_mlb_data(url)
    print(f"Successfully processed MLB data for {date_str}")


# Example of how to run the worker
if __name__ == "__main__":
    import asyncio
    
    # Run for a specific date
    #asyncio.run(process_mlb_data('https://plaintextsports.com/mlb/2024-06-07/'))
    
    # Or run the main worker function for today's date
    asyncio.run(worker_main())