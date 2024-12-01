import pytest
from database.db_setup import init_db, Session
from database.populate_db import populate_data

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Initialize the database and seed with mock data
    init_db()
    populate_data()
    yield
    # Cleanup (optional): Drop the database or close connections
