# 🚀 Data Science Club Software Development Team - Round 1 Submission
**Repository Holder & Candidate Submission** | **HackOrbit 2026 Portal**

> This single unified GitHub repository contains complete submissions for both **Task 1: Product Thinking** and **Task 2: Frontend Development Challenge** pursuant to recruitment round instructions.

---

## 📑 Repository Submission Structure
* **📌 Task 1 (Product Thinking):** [See `TASK_1_PRODUCT_THINKING.md`](./TASK_1_PRODUCT_THINKING.md) — Personal, organic product innovation and architectural feature analysis.
* **🌐 Task 2 (Frontend Web Challenge):** [Live Interactive Vercel Deployment Link](https://hackorbit-university-hackathon-p-git-a31dfb-agnishs-projects.vercel.app/) — Enterprise-grade campus hackathon portal with cloud database connectivity.

---

## 🌟 Project Overview: Why This Submission Stands Out
While standard hackathon registration websites simply present static text, **HackOrbit 2026** implements an innovative **Real-Time Cross-App Sync Architecture**:
1. **The Main Hackathon Website (`index.html`)**: The user-facing portal featuring glowing cyberpunk glassmorphic design, track details, interactive timelines, and a registration form with live validation.
2. **The Developer & Organizer Command Tower (`developer.html`)**: A dedicated developer portal that allows hackathon leads to push urgent alerts, schedule changes, and prize bounties directly into the main website's **Live Broadcast Ticker & Feed** in real-time!

When both websites are open side-by-side, notifications transmitted from the Developer Portal instantly animate into the main HackOrbit feed **without needing a page refresh** (powered by modern `BroadcastChannel` APIs and persistent `localStorage`).

---

## ✅ Checklist: Mandatory Challenge Sections
All mandatory sections from Task 2 have been seamlessly designed and integrated into `index.html`:

| Section | Location & Details | Status |
| :--- | :--- | :---: |
| **Home (Hero Section)** | Dynamic header with high-impact gradient typography, club badges, action buttons, and a live countdown. | ✔️ Complete |
| **About Section** | Explains the Data Science mission, features animated stats counters ($15k+ prizes, 48 hours, 500+ hackers), and highlights 4 AI technical tracks (NLP, Vision, Big Data, Agents). | ✔️ Complete |
| **Schedule Section** | Tabbed interactive 48-hour event roadmap covering Day 1 (Data Prep & Kickoff) and Day 2 (Model Training & Demos). | ✔️ Complete |
| **Prizes Section** | Glowing podium layouts for 1st ($7k + RTX 5090 GPUs), 2nd ($4k), and 3rd ($2k), plus a special Best Model Accuracy Track Prize. | ✔️ Complete |
| **Sponsors Section** | Tiered partner display showcasing Titanium partners (DeepMind, NVIDIA, OpenAI) and Gold partners (Hugging Face, PyTorch, GitHub Campus). | ✔️ Complete |
| **Registration Form** | Frontend-only registration application with real-time field validation, custom styling, and celebratory modal confirmation upon submission. | ✔️ Complete |

---

## 🔥 Beyond Requirement: 9 Creative Bonus & Enterprise Features!
The challenge requested adding at least 3 bonus features. This submission surpasses expectations by delivering **9 advanced creative & enterprise features**:

1. **☁️ Enterprise Supabase Cloud PostgreSQL Database & Student Portal (`🌟 My Portal`)**
   - Integrates real-time cloud data storage via `@supabase/supabase-js`. Students can log in with their university emails, browse an active campus catalog, and enroll in hackathons with an automated **Maximum 3 Concurrent Hackathons Quota**. Also includes an enterprise **90-Day Auto-Purge TTL Protocol** that automatically deletes expired user records from cloud PostgreSQL!
2. **💻 Dedicated Developer / Organizer Console (`developer.html`)**
   - A standalone dark matrix/CLI styled portal designed specifically for developers to publish and manage announcements.
3. **📡 Real-Time Cross-App Notification Sync**
   - Utilizing `window.BroadcastChannel` and persistent local storage, updates broadcasted by organizers instantly appear on the top ticker banner and feed cards of the main HackOrbit portal without reloading.
4. **⏳ Live Countdown Timer**
   - Dynamically calculates days, hours, minutes, and seconds remaining until the hackathon kickoff on November 15, 2026.
5. **📅 Interactive Schedule Timeline**
   - Tabbed filtering allowing students to effortlessly switch between Day 1 and Day 2 events with smooth fade-in animations.
6. **✔️ Real-Time Frontend Form Validation**
   - Custom Regex verification for student emails, optional GitHub repository URLs, and required field completion with helpful helper messages.
7. **🎉 Celebratory Confetti Success Modal**
   - Once the application form passes validation, a congratulatory dialog modal congratulates the hacker and prepares them for competition.
8. **🌓 Dark Mode / Cyberpunk Light Theme Switcher**
   - A theme toggle located directly in the navigation bar that recalculates CSS custom properties between Deep AI Space Obsidian and Light Analytics mode with persistence across reloads.
9. **❓ Expandable FAQ Accordion & Show/Hide Password Eye Toggle**
   - Smoothly animated drop-down question cards and interactive cybersecurity password inspection controls.

---

## 🛠️ How to Test & Review Locally

### Method 1: Instant Browser Opening (No terminal required)
1. Open the project folder `d:\P R O J E C T\website`.
2. Double-click `index.html` in Chrome, Edge, or Firefox to launch the main website.
3. Click **"💻 Open Dev Console →"** in the top right banner (or open `developer.html` directly in a second tab).

### Method 2: Local Static Server
If you prefer running via terminal:
```bash
# Using Node serve
npx -y serve .

# OR using Python
python -m http.server 8000
```
Then navigate to `http://localhost:8000` (or the corresponding port).

### 🎮 How to Experience the Real-Time Sync Magic
1. Open `index.html` (Main Site) in Tab 1 and `developer.html` (Dev Tower) in Tab 2 side-by-side.
2. In the Developer tab, enter a new broadcast:
   - **Title**: `🚀 ULTRA BOUNTY: Autonomous Agents Challenge Added!`
   - **Badge**: `💰 NEW PRIZE`
   - **Glow & Priority**: `🟡 Prize Bounty (Gold Glow)`
   - **Content**: `Submit a working multi-agent reasoning loop to win an exclusive $3,000 cash prize!`
3. Click **"⚡ BROADCAST INSTANTLY TO HACKORBIT FEED"**.
4. Glance at Tab 1 (Main Site): Notice how the glowing ticker banner at the very top updates immediately and your new card smoothly enters the Live Dev Announcements grid!

---

## 🌐 Live Deployment Instructions (Vercel / Netlify / GitHub Pages)
Since this suite is built with clean HTML, CSS, and JS, deployment takes less than 60 seconds:

### 🚀 Deploy to Vercel or Netlify
1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: HackOrbit 2026 Hackathon Portal"
   git branch -M main
   # Link to your GitHub repo and push
   git remote add origin https://github.com/yourusername/hackorbit-2026.git
   git push -u origin main
   ```
2. **Import in Netlify or Vercel**:
   - Log into [Netlify](https://netlify.com) or [Vercel](https://vercel.com) and click **"Add New Project" / "Import existing project"**.
   - Select your GitHub repository.
   - Leave build command blank (static file hosting) and click **Deploy**.
   - You will instantly receive your free SSL production URL (e.g., `https://hackorbit-2026.vercel.app`)!

---
*Built with passion, performance, and modern web aesthetics for the Data Science Club.* 🛰️
