from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Optional
from pydantic import BaseModel, Field

# Pydantic models for response validation
class OutingModel(BaseModel):
    IP: str
    H: str
    R: str
    ER: str
    BB: str
    K: str
    HR: str
    P: str
    ERA: str
    date: str

class PlayerModel(BaseModel):
    id: str = Field(alias="_id")
    name: str
    team: str
    outings: List[OutingModel]

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class PlayerAPIService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = database.players

    async def get_players_by_team(self, team_name: str) -> List[PlayerModel]:
        """Get all players from a specific team"""
        cursor = self.collection.find({"team": team_name.lower()})
        players = await cursor.to_list(length=100)
        
        if not players:
            raise HTTPException(status_code=404, detail=f"No players found for team: {team_name}")
        
        # Convert ObjectId to string
        for player in players:
            player["_id"] = str(player["_id"])
        
        return players

    async def get_player_by_id(self, player_id: str) -> PlayerModel:
        """Get a specific player by ID"""
        try:
            object_id = ObjectId(player_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid player ID format")
            
        player = await self.collection.find_one({"_id": object_id})
        
        if not player:
            raise HTTPException(status_code=404, detail=f"Player with ID {player_id} not found")
        
        # Convert ObjectId to string
        player["_id"] = str(player["_id"])
        
        return player

    async def get_all_players(self) -> List[PlayerModel]:
        """Get all players"""
        cursor = self.collection.find({})
        players = await cursor.to_list(length=100)
        
        # Convert ObjectId to string
        for player in players:
            player["_id"] = str(player["_id"])
        
        return players