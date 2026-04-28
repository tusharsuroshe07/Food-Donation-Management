# backend/init_db.py
import mysql.connector

def initialize_database():
    try:
        print("1. Connecting to local MySQL Server...")
        # Connect without specifying a database first
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="i3f7ceze"
        )
        cursor = conn.cursor()

        print("2. Creating database: food_donation_db (if it doesn't exist)...")
        cursor.execute("CREATE DATABASE IF NOT EXISTS food_donation_db")

        print("3. Connecting to the new database...")
        conn.database = "food_donation_db"

        print("4. Creating 'users' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('donor', 'ngo', 'admin') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("5. Creating 'donations' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS donations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                donor_id INT NOT NULL,
                food_type VARCHAR(255) NOT NULL,
                quantity VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                expiry_time DATETIME NOT NULL,
                status ENUM('pending', 'accepted', 'completed', 'rejected') DEFAULT 'pending',
                assigned_ngo_id INT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (donor_id) REFERENCES users(id),
                FOREIGN KEY (assigned_ngo_id) REFERENCES users(id)
            )
        """)

        conn.commit()
        cursor.close()
        conn.close()
        print("SUCCESS! Database is fully initialized and ready.")

    except Exception as e:
        print(f"FAILED to initialize database. Is XAMPP/MySQL running? Error: {e}")

if __name__ == "__main__":
    initialize_database()
