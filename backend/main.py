from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List
import asyncio
import logging
from datetime import datetime

from workers.db import get_database, ping_database
import workers.async_worker as async_worker
from api.player import PlayerAPIService, PlayerModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MLB Player Stats API",
    description="API for accessing MLB player pitching statistics",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

async def heartbeat():
    while True:
        try:
            logger.info(f"Heartbeat ping at {datetime.now()}")
            await ping_database()
            logger.info("Database connection successful")
        except Exception as e:
            logger.error(f"Heartbeat error: {str(e)}")
        
        await asyncio.sleep(840)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(heartbeat())
    logger.info("Heartbeat background task started")

def get_player_service() -> PlayerAPIService:
    database = get_database()
    return PlayerAPIService(database)

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to the MLB Player Stats API"}

@app.get("/api/ping", tags=["Health"])
async def ping():
    await ping_database()
    return {"status": "ok", "message": "Database connection successful"}

@app.get("/api/players", response_model=List[PlayerModel], tags=["Players"])
async def get_all_players(service: PlayerAPIService = Depends(get_player_service)):
    return await service.get_all_players()

@app.get("/api/players/team/{team_name}", response_model=List[PlayerModel], tags=["Players"])
async def get_players_by_team(
    team_name: str, 
    service: PlayerAPIService = Depends(get_player_service)
):
    return await service.get_players_by_team(team_name)

@app.get("/api/players/{player_id}", response_model=PlayerModel, tags=["Players"])
async def get_player_by_id(
    player_id: str, 
    service: PlayerAPIService = Depends(get_player_service)
):
    return await service.get_player_by_id(player_id)

@app.post("/api/update/{date_str}", tags=["Update"])
async def update_data(date_str: str):
    """
    Update the database with new data for a specific date.
    Format: YYYY-MM-DD
    """
    try:
        url = f'https://plaintextsports.com/mlb/{date_str}/'
        await async_worker.process_mlb_data(url)
        return {"status": "success", "message": f"Updated data for {date_str}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating data: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)