from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List
import asyncio
import logging
from datetime import datetime
import pytz

# Import APScheduler
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

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

# Create scheduler
scheduler = AsyncIOScheduler()

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
        
        await asyncio.sleep(60)

@app.on_event("startup")
async def startup_event():
    # Start heartbeat task
    asyncio.create_task(heartbeat())
    logger.info("Heartbeat background task started")
    
    # Schedule the daily worker task at 5:00 AM EST
    eastern = pytz.timezone('US/Eastern')
    scheduler.add_job(
        async_worker.worker_main,
        CronTrigger(hour=5, minute=0, timezone=eastern),
        name="daily_mlb_update",
        id="daily_mlb_update"
    )
    
    # Start the scheduler
    scheduler.start()
    logger.info("Scheduler started - worker_main will run daily at 5:00 AM EST")

@app.on_event("shutdown")
async def shutdown_event():
    # Shut down the scheduler when the app stops
    scheduler.shutdown()
    logger.info("Scheduler shut down")

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

# Add an endpoint to trigger the job manually if needed
@app.post("/api/run-worker", tags=["Admin"])
async def run_worker_manually():
    try:
        await async_worker.worker_main()
        return {"status": "success", "message": "Worker job triggered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running worker: {str(e)}")

# Add an endpoint to view scheduled jobs
@app.get("/api/scheduled-jobs", tags=["Admin"])
async def get_scheduled_jobs():
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": job.next_run_time.strftime("%Y-%m-%d %H:%M:%S %Z"),
            "trigger": str(job.trigger)
        })
    return {"jobs": jobs}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)