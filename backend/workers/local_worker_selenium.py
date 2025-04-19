from datetime import datetime, timedelta
from db import get_database
import data_parser_selenium as data_parser  # Import the Selenium version
import re
import asyncio

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
        # Check if an outing for this date already exists
        date_exists = False
        if "outings" in existing_player:
            for outing in existing_player["outings"]:
                if "date" in outing and outing["date"] == current_outing["date"]:
                    date_exists = True
                    break
        
        if not date_exists:
            # Update existing player only if this date's outing doesn't already exist
            update_data = {
                "$set": {"team": team},
                "$push": {"outings": current_outing}
            }
            await players_collection.update_one({"_id": existing_player["_id"]}, update_data)
            print(f"Updated player: {player_name}")
        else:
            print(f"Skipped player {player_name} - outing for {current_outing['date']} already exists")
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
    # This is a synchronous function so we need to run it in a separate thread
    # to avoid blocking the event loop
    player_data_list = await asyncio.to_thread(data_parser.parse_scores_page, url)
    
    if not player_data_list:
        print(f"Warning: No player data found for {date_str}")
        return
    
    # Process each player's data
    for player_data in player_data_list:
        await update_player_data(player_data, date_str)
    
    print(f"Completed processing {len(player_data_list)} player records for {date_str}")


async def worker_main():
    # Set your date range as needed
    start_date = datetime(2025, 4, 15)
    end_date = datetime(2025, 4, 18)  # Current date
    
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        url = f'https://plaintextsports.com/mlb/{date_str}/'
        
        try:
            print(f"Processing MLB data for {date_str}...")
            await process_mlb_data(url)
            print(f"Successfully processed MLB data for {date_str}")
        except Exception as e:
            print(f"Error processing data for {date_str}: {str(e)}")
        
        # Move to next day
        current_date = current_date + timedelta(days=1)
        
        # Add a delay between processing different days
        await asyncio.sleep(5)


if __name__ == "__main__":
    import asyncio

    asyncio.run(worker_main())