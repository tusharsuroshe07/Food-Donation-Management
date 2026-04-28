# Food Donation Management System 
# This Project Build For Client Requirments

This guide breaks down **every single file** in our project so you can easily understand its purpose and explain it confidently to your teachers.

---

## 💾 1. Database Files
*   **`database.sql`**
    *   **What it does:** This is the blueprint for our MySQL database. It creates a dataset called `food_donation_db` and builds two tables: `users` (to store people's passwords and roles) and `donations` (to store food items and link them to the users who posted them or accepted them).

---

## 🐍 2. Backend API (Python & Flask)
*   **`backend/app.py`**
    *   **What it does:** This is the heart of the application. We chose to use **Flask**, a lightweight Python framework, so that our entire backend logic fits neatly into one single file. This is fantastic for a school project because it's easy to read top-to-bottom.
    *   **Inside this file, you'll find:**
        *   **`@app.route('/api/auth/...')`:** Routes that handle creating new accounts and logging in safely using hashed passwords.
        *   **`@app.route('/api/donations/...')`:** Routes that let Donors add food, let NGOs view or claim food, and update statuses locally in the database using the `mysql.connector`. 
        *   **`@app.route('/api/admin/...')`:** Quick stats and user logs for the Admin panel.
        *   **`@token_required` Wrapper:** A custom Python security decorator we built. If a user tries to add food without being logged in, this stops them immediately!
*   **`backend/requirements.txt`**
    *   **What it does:** A standard Python text file listing the required libraries (like `Flask`, `PyJWT` for security, and `mysql-connector-python`). You just run `pip install -r requirements.txt` to install them all at once.

---

## 🎨 3. Frontend Views (HTML & CSS)
*   **`frontend/index.html`**
    *   **What it does:** The starting page. It contains the visual layout for the Login and Registration forms.
*   **`frontend/donor.html` & `frontend/ngo.html`**
    *   **What it does:** The dashboards for Donors (to post food and view history) and NGOs (to accept available food).
*   **`frontend/admin.html`**
    *   **What it does:** The dashboard for Admins. Displays big statistic boxes and global tables.
*   **`frontend/css/style.css`**
    *   **What it does:** Defines our green and orange color theme, hover animations, and ensures the layout is responsive (looks good on phones and laptops using Flexbox and CSS Grid).

---

## 🧠 4. Frontend Logic (JavaScript)
*   **`frontend/js/auth.js`**
    *   **What it does:** Intercepts the login form submission. It uses Javascript's built-in `fetch()` to send your email/password to the Python server running on **port 5000**. If correct, the server hands back a secret "JWT Token" which Javascript saves in your browser so you stay logged in.
*   **`frontend/js/donor.js` , `ngo.js` , and `admin.js`**
    *   **What they do:** These files run on their respective dashboard pages. They talk to the Python API to load dynamic data based on who is logged in (e.g., Donors only see their own food, Admin sees everything).

---

### 💡 Summary For Your Teacher
You can explain that the architecture is a **"Decoupled Full-Stack Application"**. This is a great industry term. It means the Frontend (HTML/JS) and Backend (Python) are completely separate. They communicate purely through RESTful JSON API endpoints. The Python backend validates tokens, queries the database, and returns the data, while vanilla Javascript paints the UI dynamically!

---

## 🚀 5. How to Run the Project

Follow these steps to run the Food Donation Management System on your local computer:

### Prerequisites:
1. **Python:** Ensure you have Python 3 installed.
2. **Database:** Ensure you have **XAMPP** installed. Open the XAMPP Control Panel and start **MySQL**. (By default, XAMPP sets the MySQL user to `root` with no password, which the project uses).

### Step-by-Step Instructions:

**1. Open a Terminal / Command Prompt**
Navigate to the main folder of the project (`Food Donation/`).

**2. Install Backend Dependencies**
Run the following command to download the required Python libraries:
```bash
pip install -r backend/requirements.txt
```
*(Tip: If you're using a virtual environment like `.venv`, ensure it is activated before running pip).*

**3. Initialize the Database**
Run the automated script to build your local MySQL database and tables:
```bash
python backend/init_db.py
```
*(You should see "SUCCESS! Database is fully initialized and ready." in the terminal)*.

**4. Start the Backend API Server**
Turn on the Flask application:
```bash
python backend/app.py
```
*(The backend is now live on `http://127.0.0.1:5000`)*.

**5. Start the Frontend Server**
Open a **new, second terminal** and navigate into the `frontend` directory, then start a simple web server:
```bash
cd frontend
python -m http.server 8000
```
*(The frontend is now live on `http://127.0.0.1:8000`)*.

**6. Use the App!**
Open your web browser (like Chrome or Edge) and go to:
👉 **http://localhost:8000**
