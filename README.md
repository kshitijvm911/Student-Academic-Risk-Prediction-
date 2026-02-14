# Academic Risk Analyzer 📊 | Logic-Based Performance Predictor

**Academic Risk Analyzer** is a proactive web application designed to identify and mitigate student academic failure before it happens. Instead of relying solely on exam results, this system uses a **"Holistic Logic Algorithm"** that evaluates a student's lifestyle (Sleep, Study Hours, Phone Usage) alongside academic metrics (Attendance, Marks) to calculate a precise **Risk Profile**. It provides instant, actionable feedback to students and data-driven insights to faculty.

Live demo:https://academic-risk-analyzer.web.app/index.html


🚀 **Key Features**

### 1. 🧘 Student Portal (Self-Analysis)

* **Public Access:** No login required; students can instantly assess their current standing.
* **Holistic Data Entry:** Captures critical data points: 📅 Attendance, 🎯 Marks, 📖 Study Hours, 🛏️ Sleep Patterns, and 📱 Screen Time.
* **Logic-Based Risk Engine:** Instantly calculates risk (High/Medium/Low) based on weighted thresholds (e.g., <75% attendance triggers High Risk).
* **Smart Recommendation Engine:** Generates specific, actionable tips based on inputs (e.g., *"⚠️ Attendance Critical: You are below 75%"* or *"😴 Sleep Deprived: You are getting less than 6 hours"*).

### 2. 👨‍🏫 Faculty Dashboard (Data Visualization)

* **Secure Access:** Role-based login ensures only authorized staff can view sensitive student data.
* **Live Class Analytics:**
* **Doughnut Chart:** Visualizes the class-wide distribution of High vs. Low risk students.
* **Search & Filter:** Instantly find students by name within the specific department.


* **Deep-Dive Modal (Spider Chart):** Clicking "View" opens a dynamic **Radar Chart** that maps the student's life balance (Sleep vs. Study vs. Phone), allowing teachers to spot root causes of failure instantly.

### 3. 🛡️ Admin Panel (Management)

* **Master Control:** Secure environment for the Head of Department or Administrator.
* **Faculty Management:** Create, monitor, and delete faculty credentials using a secure secondary-instance auth flow.
* **Global Overview:** View and manage student records across **all departments** (CSE, ECE, MECH, etc.).
* **Database Integrity:** Capability to purge old records or remove unauthorized faculty access.

---

### 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Modern UI with Glassmorphism), Vanilla JavaScript (ES6).
* **Visualization:** **Chart.js** (for Pie and Radar/Spider charts).
* **Backend:** **Firebase** (Google Cloud).
* **Database:** **Cloud Firestore** (NoSQL Real-time Database).
* **Authentication:** Firebase Auth (Email/Password) & Session Management.

---

### 📂 Project Structure

```text
/
├── index.html       # Student Portal (Risk Form & Tips Engine)
├── login.html       # Unified Gateway (Admin & Faculty Login)
├── faculty.html     # Teacher Dashboard (Charts & Data Tables)
├── admin.html       # Admin Panel (Faculty Creation & Global Data)
├── script.js        # Core Logic (Risk Algo, Auth, Chart Rendering)
├── style.css        # Responsive UI & Animations
└── firebase.json    # Hosting Configuration

```
