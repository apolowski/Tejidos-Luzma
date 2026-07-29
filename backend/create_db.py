import psycopg
from psycopg.errors import DuplicateDatabase

try:
    # Connect to the default postgres database to create a new one
    conn = psycopg.connect(
        dbname="postgres",
        user="postgres",
        password="root",
        host="localhost",
        port=5432,
        autocommit=True
    )
    
    cur = conn.cursor()
    cur.execute("CREATE DATABASE luzma_tejidos")
    print("Database 'luzma_tejidos' created successfully.")
    
    cur.close()
    conn.close()
except DuplicateDatabase:
    print("Database 'luzma_tejidos' already exists.")
except Exception as e:
    print(f"Error: {e}")
