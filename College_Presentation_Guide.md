# 🎓 Food Donation Management System -  Presentation Guide

This document is designed to help you prepare for your college presentation. It breaks down the entire structure of the project file by file. It is written in a friendly, easy-to-explain format so you can use it as speaking notes!

---

## 🏗️ 1. System Architecture Overview
*(To say at the start of your presentation)*

> "Our project uses a modern **Decoupled Full-Stack Architecture**. This means the frontend (what the user sees) and the backend (where the data is processed) are completely separate programs. They communicate exclusively through a RESTful JSON API. 
> - **Frontend**: Built with purely raw HTML, CSS, and Vanilla JavaScript.
> - **Backend**: Built using a lightweight Python framework called Flask.
> - **Database**: Uses MySQL for persistent, structured data storage."

---

## 🐍 2. Backend Files (Python Logic & Database)
*Location: `/backend/` folder*

### `backend/app.py`
* **What it is:** The heart and brain of our API server.
* **How to explain it:** "This is our master Python file powered by the **Flask** framework. It acts as a traffic director. When a user tries to log in, post a donation, or view data, this file processes the request, checks security credentials, talks to the MySQL database, and sends back the result in JSON format. It uses clean `@app.route` decorators to separate different API endpoints like `/api/auth/login` and `/api/donations/create`."

### `backend/init_db.py`
* **What it is:** An automation script for setting up the database.
* **How to explain it:** "Rather than telling people to manually click through a database tool to create tables, we wrote this Python script. When you run it using `mysql.connector`, it automatically generates the `food_donation_db` and builds out the rigid structures for our `users` table and `donations` table, establishing foreign keys seamlessly."

### `backend/requirements.txt`
* **What it is:** The dependency manager.
* **How to explain it:** "A standard Python text file that lists external packages like `Flask` for the server, `PyJWT` for generating secure login tokens, and `mysql-connector-python` to talk to XAMPP. It ensures that anyone on any computer can set up the environment with one command."

---

## 🎨 3. Frontend HTML Files (The User Interface structure)
*Location: `/frontend/` folder*

### `frontend/index.html`
* **What it is:** The Entry / Landing Page.
* **How to explain it:** "This is the very first page users land on. We built a dynamic, responsive view that holds the Login and Registration forms. It asks users to specify if they are signing up as a 'Donor', an 'NGO', or an 'Admin'."

### `frontend/donor.html`
* **What it is:** The Dashboard specific for Food Donors.
* **How to explain it:** "Once a donor signs in, they are brought here. The page has a simple, accessible form allowing them to submit details about surplus food (like portion size, location, and expiry time). Below the form, it displays a dynamic table tracking the status of their past donations."

### `frontend/ngo.html`
* **What it is:** The Dashboard for Partner NGOs/Charities.
* **How to explain it:** "This page acts as a live bulletin board. It fetches all pending food donations across the system. NGOs can browse what's available globally and click an 'Accept' button to take responsibility for claiming the food before it expires."

### `frontend/admin.html`
* **What it is:** The System Oversight Dashboard.
* **How to explain it:** "An administrative panel that provides a bird's-eye view of the system's impact. It queries special Admin-only endpoints to render large statistical numbers (Total Users, Total Donations) and displays a master-list of all users who have signed up."

---

## 💅 4. Frontend CSS (Styling)
*Location: `/frontend/css/` folder*

### `frontend/css/style.css`
* **What it is:** The visual layout language.
* **How to explain it:** "We used pure Vanilla CSS without relying on heavy frontend frameworks like Bootstrap. By using modern CSS Layout modules like **Flexbox** and **CSS Grid**, our dashboards remain 100% responsive—meaning they rearrange themselves perfectly whether you're viewing the project on a big laptop or a small smartphone screen."

---

## 🧠 5. Frontend JavaScript (Interactivity)
*Location: `/frontend/js/` folder*

*(Key Concept: Javascript intercepting the default page reload, sending data in the background (Ajax/Fetch), and manipulating the Document Object Model (DOM).)*

### `frontend/js/auth.js`
* **What it is:** Registration and Login mechanism.
* **How to explain it:** "This script intercepts the form when the user clicks 'Login'. Instead of refreshing the page, it uses the JavaScript `fetch()` API to securely transmit the email and password to our Python server. Upon success, it receives a **JWT (JSON Web Token)**, saves it to the browser's Local Storage, and redirects the user to their correct dashboard."

### `frontend/js/donor.js`
* **What it is:** Interactivity for the Donor page.
* **How to explain it:** "This file manages two main tasks. First, when the donor presses 'Donate', it packages their form data into JSON and POSTs it to Python. Second, it fetches their previous donation history on page-load and dynamically builds HTML table rows so they can see if an NGO has accepted their listed food."

### `frontend/js/ngo.js`
* **What it is:** Interactivity for the NGO page.
* **How to explain it:** "This code pulls the global feed of unclaimed food. It also handles the 'Accept' button functionality. When an NGO clicks accept, this JavaScript fires off a request to the backend with their security token, marking the food item under their NGO's specific ID in the database."

### `frontend/js/admin.js`
* **What it is:** Data rendering for the Admin page.
* **How to explain it:** "This script is responsible for making authorized GET requests to the admin APIs. It takes the returned statistics—like total active users and completed deliveries—and dynamically updates the text values inside the large dashboard counter cards on the screen."

---

### 🌟 Bonus Tips for Your Presentation:
1. **Show over Tell:** Run the project during the presentation (start the Python server and the HTTP server like you normally do). Have it open in two different windows: log in as a Donor in one, and as an NGO in the other, and show a donation passing between them live!
2. **Mention "Security":** Tell your professor about the **JWT (JSON Web Token)**. It sounds advanced and proves that you've implemented real, stateless user authentication!
3. **Mention "Separation of Concerns":** Use this phrase to explain why there are different HTML and JS files for each role (Donor vs NGO vs Admin) rather than bunching it all in one file. It makes code easier to maintain!
