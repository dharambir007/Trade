import logging
from pymongo import MongoClient, ASCENDING
from pymongo.errors import PyMongoError
from config import MONGODB_URI, DATABASE_NAME

logger = logging.getLogger("uvicorn.error")

_client = None

def get_client() -> MongoClient:
    global _client
    if _client is None:
        try:
            _client = MongoClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
            # Test connection ping
            _client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
        except PyMongoError as e:
            logger.warning(f"MongoDB connection ping failed/delayed: {e}")
    return _client

def get_database():
    client = get_client()
    return client[DATABASE_NAME]

def get_users_collection():
    db = get_database()
    collection = db["users"]
    try:
        # Create unique index on email
        collection.create_index([("email", ASCENDING)], unique=True, background=True)
    except Exception as e:
        logger.warning(f"Index creation notice: {e}")
    return collection
