/**
 * HackOrbit 2026 - Master Frontend JavaScript Engine
 * Powers: Live Dev Notification Sync, Countdown Timer, Interactive Timeline, Form Validation, Theme Toggle, FAQ Accordion
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initCountdownTimer();
    initScheduleTabs();
    initFaqAccordion();
    initFormValidation();
    initLiveBroadcastSync();

    // Ensure registration links unlock and show the registration form when clicked
    document.querySelectorAll('a[href="#register"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const reg = document.getElementById('register');
            if (reg) {
                reg.style.display = 'block';
            }
        });
    });
});

/* =========================================================
   1. REAL-TIME LIVE DEV NOTIFICATION SYNC ENGINE
========================================================= */
const DEFAULT_BROADCASTS = [
    {
        id: '1',
        title: '🔥 New Prize Bounty: $3,000 for Agentic AI',
        text: 'DeepMind just added a bonus bounty for teams building self-improving autonomous agents during the weekend!',
        category: 'NEW PRIZE',
        priority: 'urgent',
        eventDate: 'Day 1 (Nov 14) - 05:30 PM',
        timestamp: 'Day 1 (Nov 14) - 05:30 PM'
    },
    {
        id: '2',
        title: '⚠️ Preliminary Data Challenge Released',
        text: 'The financial sentiment dataset for Track #3 is now available in the starter repository. Start cleaning your data!',
        category: 'SCHEDULE',
        priority: 'prize',
        eventDate: 'Day 1 (Nov 14) - 07:00 PM',
        timestamp: 'Day 1 (Nov 14) - 07:00 PM'
    },
    {
        id: '3',
        title: '💡 Mentor Support via Discord & Townhall',
        text: 'Stuck on debugging PyTorch tensors or LLM embeddings? Our roaming engineering mentors are stationed in Room 402!',
        category: 'INFO',
        priority: 'info',
        eventDate: 'Day 2 (Nov 15) - 10:00 AM',
    }
];

const DEFAULT_ECOSYSTEM = {
    subtitle: "Why Compete?",
    title: "Enter the <span class=\"text-gradient\">Ecosystem</span>",
    desc: "A platform where innovation meets opportunity, empowering participants to create cutting-edge solutions through collaboration, creativity, and technical excellence.",
    stats: [
        { value: "$15K+", label: "Prize Pool & Bounties", style: "text-gradient" },
        { value: "48", label: "Hours of Coding", style: "color: var(--accent-cyan);" },
        { value: "500+", label: "Global Hackers", style: "color: var(--accent-magenta);" },
        { value: "4", label: "AI & MLOps Tracks", style: "color: var(--accent-emerald);" }
    ],
    tracks: [
        { icon: "🧠", title: "NLP & GenAI", desc: "Build retrieval-augmented generation (RAG) models, custom LLMs, or creative multimodal tools that push language comprehension to new heights." },
        { icon: "👁️", title: "Computer Vision & Robotics", desc: "Develop neural networks capable of scene understanding, autonomous navigation, medical diagnosis, or ultra-fast video analytics." },
        { icon: "📊", title: "Big Data & MLOps", desc: "Engineer lightning-fast data processing pipelines, real-time fraud detection systems, or automated inference monitoring platforms." },
        { icon: "🤖", title: "Autonomous Agents", desc: "Design self-directed agentic ecosystems that execute complex reasoning loops, API orchestrations, and autonomous coding tasks." }
    ]
};

const DEFAULT_FAQ = {
    subtitle: "Got Questions?",
    title: "Frequently Asked <span class=\"text-gradient\">Questions</span>",
    desc: "Everything you need to know about competing in HackOrbit 2026.",
    items: [
        {
            q: "Who is eligible to participate in HackOrbit 2026?",
            a: "All university undergraduate, graduate students, and bootcamp coders worldwide are welcome to participate! You can compete individually or in teams of up to 4 hackers."
        },
        {
            q: "Do I need prior experience developing neural networks or LLMs?",
            a: "Not at all! Whether you are a beginner exploring introductory Python data science or an advanced deep learning researcher, HackOrbit provides beginner workshops, mentor support, and cloud credits for everyone."
        },
        {
            q: "How does the Live Developer Notification Feed work?",
            a: "Our website features a real-time notification sync architecture! Organizers and developers can open the Developer Console (link in header/footer) and broadcast urgent announcements, room changes, or prize updates directly to this frontend without requiring page refreshes."
        },
        {
            q: "How much does it cost to attend?",
            a: "HackOrbit is 100% free! We provide meals, beverages, hardware access, cloud GPUs, mentorship, and awesome swag at zero cost to participants thanks to our incredible sponsors."
        }
    ]
};

function initLiveBroadcastSync() {
    const tickerText = document.getElementById('tickerText');

    // Initialize default broadcasts, ecosystem, and faq in localStorage if empty
    if (!localStorage.getItem('hackorbit_broadcasts')) {
        localStorage.setItem('hackorbit_broadcasts', JSON.stringify(DEFAULT_BROADCASTS));
    }
    let storedEco = JSON.parse(localStorage.getItem('hackorbit_ecosystem'));
    if (!storedEco) {
        localStorage.setItem('hackorbit_ecosystem', JSON.stringify(DEFAULT_ECOSYSTEM));
    } else {
        let needsSave = false;
        if (storedEco.desc && storedEco.desc.startsWith("HackOrbit connects elite student")) {
            storedEco.desc = "A platform where innovation meets opportunity, empowering participants to create cutting-edge solutions through collaboration, creativity, and technical excellence.";
            needsSave = true;
        }
        if (storedEco.title && storedEco.title.includes("Data Ecosystem")) {
            storedEco.title = "Enter the <span class=\"text-gradient\">Ecosystem</span>";
            needsSave = true;
        }
        if (needsSave) {
            localStorage.setItem('hackorbit_ecosystem', JSON.stringify(storedEco));
        }
    }
    if (!localStorage.getItem('hackorbit_faq')) {
        localStorage.setItem('hackorbit_faq', JSON.stringify(DEFAULT_FAQ));
    }

    function renderEcosystem() {
        const headerDiv = document.getElementById('ecosystemHeader');
        const statsDiv = document.getElementById('ecosystemStats');
        const tracksDiv = document.getElementById('ecosystemTracks');
        if (!headerDiv || !statsDiv || !tracksDiv) return;

        let eco = JSON.parse(localStorage.getItem('hackorbit_ecosystem')) || DEFAULT_ECOSYSTEM;

        // Render Header
        headerDiv.innerHTML = `
            <span class="section-subtitle">${eco.subtitle || 'Why Compete?'}</span>
            <h2 class="section-title">${eco.title || 'Enter the <span class="text-gradient">Ecosystem</span>'}</h2>
            <p style="color: var(--text-muted); max-width: 700px; margin: 0.5rem auto 0;">${eco.desc || ''}</p>
        `;

        // Render Stats
        const colorPalette = [
            'class="stat-value text-gradient"',
            'class="stat-value" style="color: var(--accent-cyan);"',
            'class="stat-value" style="color: var(--accent-magenta);"',
            'class="stat-value" style="color: var(--accent-emerald);"',
            'class="stat-value" style="color: var(--accent-gold);"',
            'class="stat-value" style="color: var(--accent-purple);"'
        ];
        if (eco.stats && Array.isArray(eco.stats)) {
            statsDiv.innerHTML = eco.stats.map((st, idx) => {
                let styleAttr = colorPalette[idx % colorPalette.length];
                if (st.style === 'text-gradient') styleAttr = 'class="stat-value text-gradient"';
                else if (st.style && st.style !== 'text-gradient') styleAttr = `class="stat-value" style="${st.style}"`;
                return `
                    <div class="glass-card stat-box">
                        <span ${styleAttr}>${st.value || ''}</span>
                        <span class="stat-label">${st.label || ''}</span>
                    </div>
                `;
            }).join('');
        }

        // Render Tracks
        if (eco.tracks && Array.isArray(eco.tracks)) {
            tracksDiv.innerHTML = eco.tracks.map(tr => `
                <div class="glass-card track-card">
                    <div class="track-icon">${tr.icon || '🎯'}</div>
                    <h3 class="track-title">${tr.title || ''}</h3>
                    <p class="track-desc">${tr.desc || ''}</p>
                </div>
            `).join('');
        }
    }

    function renderFaq() {
        const headerDiv = document.getElementById('faqSectionHeader');
        const containerDiv = document.getElementById('faqContainer');
        if (!headerDiv || !containerDiv) return;

        let faqData = JSON.parse(localStorage.getItem('hackorbit_faq')) || DEFAULT_FAQ;

        headerDiv.innerHTML = `
            <span class="section-subtitle">${faqData.subtitle || 'Got Questions?'}</span>
            <h2 class="section-title">${faqData.title || 'Frequently Asked <span class="text-gradient">Questions</span>'}</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">${faqData.desc || ''}</p>
        `;

        if (faqData.items && Array.isArray(faqData.items)) {
            containerDiv.innerHTML = faqData.items.map(item => `
                <div class="glass-card faq-item">
                    <div class="faq-header">
                        <span>${item.q || ''}</span>
                        <span class="faq-icon">+</span>
                    </div>
                    <div class="faq-content">
                        ${item.a || ''}
                    </div>
                </div>
            `).join('');
            // Reinitialize accordion event listeners for newly rendered FAQ items
            if (typeof initFaqAccordion === 'function') {
                initFaqAccordion();
            }
        }
    }

    // Function to render broadcasts in header ticker and active schedule tab
    function processBroadcastSync() {
        const data = JSON.parse(localStorage.getItem('hackorbit_broadcasts')) || [];

        // Update the top ticker banner with the latest announcement
        if (data[0] && tickerText) {
            tickerText.innerText = `⚡ ${data[0].title} — ${data[0].text}`;
        }

        // Render ecosystem and FAQ updates
        renderEcosystem();
        renderFaq();

        // Dynamically re-render the currently viewed tab on the home portal!
        if (typeof window.refreshScheduleTab === 'function') {
            window.refreshScheduleTab();
        }
    }

    // Helper function to get exact snapshot of all storage items
    function getStorageSnapshot() {
        return [
            localStorage.getItem('hackorbit_broadcasts') || '',
            localStorage.getItem('hackorbit_schedule') || '',
            localStorage.getItem('hackorbit_custom_prizes') || '',
            localStorage.getItem('hackorbit_podium_prizes') || '',
            localStorage.getItem('hackorbit_schedule_labels') || '',
            localStorage.getItem('hackorbit_day_labels') || '',
            localStorage.getItem('hackorbit_ecosystem') || '',
            localStorage.getItem('hackorbit_faq') || ''
        ].join('|');
    }

    // Track last rendered state for polling fallback
    let lastRenderedState = getStorageSnapshot();

    function triggerFeedUpdate() {
        processBroadcastSync();
        lastRenderedState = getStorageSnapshot();
        const banner = document.getElementById('tickerBanner');
        if (banner) {
            banner.style.boxShadow = '0 0 35px rgba(255, 56, 100, 0.9)';
            setTimeout(() => { banner.style.boxShadow = ''; }, 1500);
        }
    }

    // Initial Render
    processBroadcastSync();
    lastRenderedState = getStorageSnapshot();

    // 1. Listen via BroadcastChannel (Instant cross-tab messaging)
    try {
        const channel = new BroadcastChannel('hackorbit_live_channel');
        channel.onmessage = (event) => {
            if (event.data && (event.data.type === 'UPDATE_FEED' || event.data.type === 'UPDATE_ECOSYSTEM' || event.data.type === 'UPDATE_FAQ')) {
                triggerFeedUpdate();
            }
        };
    } catch (e) {
        console.warn('BroadcastChannel not supported in this browser environment.');
    }

    // 2. Listen for standard window storage event
    window.addEventListener('storage', (e) => {
        if (e.key === 'hackorbit_broadcasts' || e.key === 'hackorbit_schedule' || e.key === 'hackorbit_custom_prizes' || e.key === 'hackorbit_podium_prizes' || e.key === 'hackorbit_ecosystem' || e.key === 'hackorbit_faq') {
            triggerFeedUpdate();
        }
    });

    // 3. Ultra-resilient auto-sync poll (Every 800ms)
    setInterval(() => {
        const curState = getStorageSnapshot();
        if (curState && curState !== lastRenderedState) {
            triggerFeedUpdate();
        }
    }, 800);
}

/* =========================================================
   2. COUNTDOWN TIMER ENGINE (Target: Nov 15, 2026)
========================================================= */
function initCountdownTimer() {
    const daysEl = document.getElementById('days');
    if (!daysEl) return; // Safely exit if timer is not present on page

    const targetDate = new Date('November 15, 2026 09:00:00 GMT-0500').getTime();
    
    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance <= 0) {
            if (document.getElementById('days')) document.getElementById('days').innerText = '00';
            if (document.getElementById('hours')) document.getElementById('hours').innerText = '00';
            if (document.getElementById('minutes')) document.getElementById('minutes').innerText = '00';
            if (document.getElementById('seconds')) document.getElementById('seconds').innerText = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (document.getElementById('days')) document.getElementById('days').innerText = String(days).padStart(2, '0');
        if (document.getElementById('hours')) document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        if (document.getElementById('minutes')) document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        if (document.getElementById('seconds')) document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

/* =========================================================
   3. INTERACTIVE SCHEDULE TIMELINE ENGINE
========================================================= */
const DEFAULT_SCHEDULE_DATA = {
    day1: [
        { id: 'd1_1', time: '09:00 AM - 10:30 AM', title: '🛰️ Check-in, Breakfast & Data Science Club Opening Keynote', desc: 'Pick up your official HackOrbit hardware, name badges, and fuel up on coffee while our organizers introduce the challenge dataset criteria.' },
        { id: 'd1_2', time: '11:00 AM - 12:00 PM', title: '🔥 Team Formation & Brainstorming Mixers', desc: 'Find teammates, mingle with engineering leads, and pitch high-level architectures before locking in your official challenge track.' },
        { id: 'd1_3', time: '01:30 PM - 03:00 PM', title: '🧠 Workshop: Building Advanced RAG Pipelines with Hugging Face & Vector DBs', desc: 'Hands-on training session on fine-tuning LLMs and connecting high-speed vector embeddings for semantic reasoning.' },
        { id: 'd1_4', time: '06:00 PM - 07:00 PM', title: '🍕 Cyber Pizza Feast & GPU Cluster Setup Check', desc: 'Dinner served in the town hall. Technical assistants will verify every team has functional SSH access to our NVIDIA RTX 5090 clusters.' },
        { id: 'd1_5', time: '11:00 PM - LATE', title: '☕ Midnight Gaming Arena & Espresso Bar', desc: 'Take a quick mental recharge with Super Smash Bros tournaments, VR racing, and free-flowing cold brew espresso.' }
    ],
    day2: [
        { id: 'd2_1', time: '08:30 AM - 10:00 AM', title: '🥐 Day 2 Reboot Breakfast & Preliminary Model Validation Checkpoint', desc: 'Mentors circle the tables to review preliminary loss curves and test set evaluations to ensure stable deployments.' },
        { id: 'd2_2', time: '11:30 AM - 12:30 PM', title: '⚡ Workshop: Deploying AI Models to Serverless & Streamlit in Record Time', desc: 'Learn how to transform raw Python inference scripts into beautiful user-facing web applications in under 15 minutes.' },
        { id: 'd2_3', time: '03:00 PM - 03:30 PM', title: '🚨 OFFICIAL CODE FREEZE & SUBMISSION DEADLINE', desc: 'All GitHub repositories must be set to public and deployed links uploaded to the review portal. Code modifications disabled.' },
        { id: 'd2_4', time: '04:00 PM - 06:00 PM', title: '🏆 Live Demo Expo & Judges Assessment Round', desc: 'Teams pitch their working prototypes live at their tables to our visiting data science industry executives and club officers.' },
        { id: 'd2_5', time: '06:30 PM - 07:30 PM', title: '👑 Awards Ceremony & Grand Closing Celebration', desc: 'Crowning our HackOrbit champions, distributing over $15,000 in bounties, and concluding keynote!' }
    ]
};

function initScheduleTabs() {
    const dayTabsContainer = document.getElementById('dayTabsContainer');
    const timelineContent = document.getElementById('timelineContent');
    
    if (!localStorage.getItem('hackorbit_schedule')) {
        localStorage.setItem('hackorbit_schedule', JSON.stringify(DEFAULT_SCHEDULE_DATA));
    }
    if (!localStorage.getItem('hackorbit_schedule_labels')) {
        const defaultLabels = {
            day1: 'Day 1: Kickoff & Data Prep',
            day2: 'Day 2: Training & Demos'
        };
        localStorage.setItem('hackorbit_schedule_labels', JSON.stringify(defaultLabels));
    }

    // Track active mode ('live' or 'schedule') and active day ('day1', 'day2', etc.)
    let currentMode = 'live';
    let currentDay = 'day1';
    window.currentScheduleTab = 'live_updates';

    window.refreshScheduleTab = function() {
        if (currentMode === 'live') {
            renderLiveFeed();
        } else if (currentMode === 'schedule') {
            openSchedule(currentDay, false);
        }
    };

    window.returnToLiveFeed = function() {
        renderLiveFeed();
        const target = document.querySelector('#schedule');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    function renderLiveFeed() {
        currentMode = 'live';
        window.currentScheduleTab = 'live_updates';
        if (dayTabsContainer) dayTabsContainer.style.display = 'none';
        const liveHeader = document.getElementById('liveEventsHeader');
        if (liveHeader) liveHeader.style.display = 'block';
        const registerSec = document.getElementById('register');
        if (registerSec) registerSec.style.display = 'none';
        timelineContent.innerHTML = '';
        const data = JSON.parse(localStorage.getItem('hackorbit_broadcasts')) || [];
        
        if (data.length === 0) {
            timelineContent.innerHTML = `
                <div class="glass-card timeline-card" style="text-align: center; padding: 3rem; cursor: pointer;">
                    <h4 class="timeline-title" style="margin-bottom: 0.5rem;">No organizer broadcasts pushed yet.</h4>
                    <p class="timeline-desc">Organizers and developers push live alerts from the <a href="developer.html" target="_blank" style="color: var(--accent-cyan); text-decoration: underline;">Dev Command Tower</a>.</p>
                    <p style="margin-top: 1rem; color: var(--accent-cyan); font-weight: 600;">👉 Click here to open full Event Schedule & Rewards view!</p>
                </div>
            `;
            const card = timelineContent.querySelector('.glass-card');
            if (card) card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A') openSchedule('all');
            });
            return;
        }
        
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item animate-in';
            div.innerHTML = `
                <div class="glass-card timeline-card ${item.priority || ''}" style="border-top-color: var(--accent-cyan); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; height: 100%; justify-content: space-between;">
                    <div>
                        <span class="timeline-time" style="color: var(--accent-cyan); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.8rem;">
                            <span style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.95rem;">📅 ${item.eventDate || item.timestamp || 'Live Alert'} <span class="feed-tag" style="font-size: 0.78rem; padding: 0.2rem 0.6rem;">[${item.category}]</span></span>
                        </span>
                        <h4 class="timeline-title" style="margin-top: 0.3rem; font-size: 1.5rem;">${item.title}</h4>
                        <p class="timeline-desc" style="margin-top: 0.6rem; font-size: 1rem; line-height: 1.6;">${item.text}</p>
                    </div>
                    <div style="margin-top: 1.8rem; border-top: 1px solid var(--border-glow); padding-top: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.6rem;">
                        <span style="font-size: 0.85rem; background: rgba(0, 245, 212, 0.12); color: #00f2fe; padding: 0.4rem 1.2rem; border-radius: 6px; border: 1px dashed var(--accent-cyan); font-weight: 600; display: inline-block; letter-spacing: 0.5px;">
                            👉 Click to open full Event Schedule & Rewards view
                        </span>
                        <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem;">
                            📡 Broadcasted live from Dev Command Tower
                        </div>
                    </div>
                </div>
            `;
            // Clicking any live event card opens up the full specific event schedule and champions showcase!
            div.querySelector('.glass-card').addEventListener('click', (e) => {
                if (e.target.tagName !== 'A') {
                    openSchedule('all');
                }
            });
            timelineContent.appendChild(div);
        });
    }

    function openSchedule(dayKey, scroll = true) {
        currentMode = 'schedule';
        currentDay = dayKey;
        window.currentScheduleTab = 'full_event_view';
        if (dayTabsContainer) {
            dayTabsContainer.style.display = 'none';
        }
        const liveHeader = document.getElementById('liveEventsHeader');
        if (liveHeader) {
            liveHeader.style.display = 'none';
        }
        const registerSec = document.getElementById('register');
        if (registerSec) registerSec.style.display = 'block';

        timelineContent.innerHTML = `
            <div style="grid-column: 1 / -1; margin-bottom: 2rem; display: flex; justify-content: flex-start;">
                <button onclick="window.returnToLiveFeed && window.returnToLiveFeed()" style="background: rgba(0, 242, 254, 0.12); border: 1px solid #00f2fe; color: #00f2fe; padding: 0.6rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; transition: all 0.2s; box-shadow: 0 0 15px rgba(0, 242, 254, 0.15);">
                    🔙 Return to Live Events Feed
                </button>
            </div>
        `;

        const curSchedule = JSON.parse(localStorage.getItem('hackorbit_schedule')) || DEFAULT_SCHEDULE_DATA;
        const curLabels = JSON.parse(localStorage.getItem('hackorbit_day_labels')) || JSON.parse(localStorage.getItem('hackorbit_schedule_labels')) || { day1: 'Day 1: Kickoff & Data Prep', day2: 'Day 2: Training & Demos' };

        // 1. Render all Schedule Days sequentially
        Object.keys(curSchedule).forEach(dKey => {
            const label = curLabels[dKey] || dKey.toUpperCase();
            const events = curSchedule[dKey] || [];

            const headerDiv = document.createElement('div');
            headerDiv.style.width = '100%';
            headerDiv.style.gridColumn = '1 / -1';
            headerDiv.style.marginTop = '1rem';
            headerDiv.style.marginBottom = '1.2rem';
            headerDiv.style.borderBottom = '1px dashed var(--border-glow, #374151)';
            headerDiv.style.paddingBottom = '0.6rem';
            headerDiv.innerHTML = `<h3 style="color: #fff; font-size: 1.6rem; font-weight: 800; margin: 0;"><span style="color: var(--accent-cyan);">📅</span> ${label}</h3>`;
            timelineContent.appendChild(headerDiv);

            if (events.length === 0) {
                const emptyItem = document.createElement('div');
                emptyItem.style.width = '100%';
                emptyItem.style.gridColumn = '1 / -1';
                emptyItem.innerHTML = `
                    <div class="glass-card timeline-card" style="text-align: center; padding: 2.5rem; width: 100%;">
                        <h4 style="color: #64748b; margin: 0; font-size: 1.1rem;">No schedule sessions posted for this day yet.</h4>
                    </div>
                `;
                timelineContent.appendChild(emptyItem);
            } else {
                events.forEach(ev => {
                    const item = document.createElement('div');
                    item.className = 'timeline-item animate-in';
                    item.innerHTML = `
                        <div class="glass-card timeline-card">
                            <span class="timeline-time" style="color: var(--accent-cyan); font-weight: 700; font-family: 'JetBrains Mono', monospace; display: block; margin-bottom: 0.4rem;">⏰ ${ev.time}</span>
                            <h4 class="timeline-title" style="font-size: 1.35rem; margin-bottom: 0.5rem;">${ev.title}</h4>
                            <p class="timeline-desc" style="font-size: 1rem; line-height: 1.5;">${ev.desc}</p>
                        </div>
                    `;
                    timelineContent.appendChild(item);
                });
            }
        });

        // 2. Render Champion Prizes ("Champions Mode") directly below when scrolling down!
        const defaultPodium = {
            first: { rank: '1st Place Champion', amount: '$7,000', perks: ['✦ $7,000 Team Cash Prize', '✦ 4x NVIDIA RTX 5090 GPUs', '✦ Fast-track Data Science Internships', '✦ $10,000 AWS/GCP Cloud Credits', '✦ Keynote Feature at Club Showcase'] },
            second: { rank: '2nd Place', amount: '$4,000', perks: ['✦ $4,000 Team Cash Prize', '✦ 1 Year Hugging Face Pro', '✦ $5,000 Cloud Compute Credits', '✦ Exclusive Club Swag Bags'] },
            third: { rank: '3rd Place', amount: '$2,000', perks: ['✦ $2,000 Team Cash Prize', '✦ 6 Months JetBrains AI Pro', '✦ $2,500 Cloud Compute Credits', '✦ HackOrbit Trophy & Hoodies'] },
            track: { title: '🎯 Best Model Accuracy Track Prize: $2,000', desc: 'Awarded to the team that achieves the highest test-set benchmark accuracy on our secret evaluation dataset!' }
        };
        const podium = JSON.parse(localStorage.getItem('hackorbit_podium_prizes')) || defaultPodium;
        const customPrizes = JSON.parse(localStorage.getItem('hackorbit_custom_prizes')) || [];

        const prizesContainer = document.createElement('div');
        prizesContainer.style.width = '100%';
        prizesContainer.style.gridColumn = '1 / -1';
        prizesContainer.style.marginTop = '4rem';
        prizesContainer.style.paddingTop = '3.5rem';
        prizesContainer.style.borderTop = '2px dashed #f59e0b';
        prizesContainer.className = 'animate-in';
        prizesContainer.innerHTML = `
            <div class="section-header" style="margin-bottom: 2.5rem;">
                <span class="section-subtitle" style="color: #f59e0b;">Glory & Rewards</span>
                <h2 class="section-title">Champion <span class="text-gradient">Prizes</span></h2>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Win high-end hardware, cash rewards, and fast-track interviews with top data science firms.</p>
            </div>

            <div class="podium-grid" style="margin-bottom: 2.5rem;">
                <div class="glass-card prize-card">
                    <span class="prize-medal">🥈</span>
                    <h3 class="prize-rank">${podium.second.rank || '2nd Place'}</h3>
                    <span class="prize-amount">${podium.second.amount}</span>
                    <ul class="prize-perks">
                        ${(podium.second.perks || []).map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>

                <div class="glass-card prize-card first">
                    <span class="prize-medal">🏆</span>
                    <h3 class="prize-rank" style="color: var(--accent-gold, #f59e0b);">${podium.first.rank || '1st Place Champion'}</h3>
                    <span class="prize-amount">${podium.first.amount}</span>
                    <ul class="prize-perks">
                        ${(podium.first.perks || []).map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>

                <div class="glass-card prize-card">
                    <span class="prize-medal">🥉</span>
                    <h3 class="prize-rank">${podium.third.rank || '3rd Place'}</h3>
                    <span class="prize-amount">${podium.third.amount}</span>
                    <ul class="prize-perks">
                        ${(podium.third.perks || []).map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div style="max-width: 750px; margin: 2rem auto 0; display: flex; flex-direction: column; gap: 1.2rem;">
                <div class="glass-card" style="padding: 1.5rem; border-color: var(--accent-cyan); text-align: center; box-shadow: 0 0 20px rgba(0, 242, 254, 0.1);">
                    <h4 style="color: var(--accent-cyan); font-size: 1.25rem; margin-bottom: 0.4rem; font-weight: 800;">${(podium.track || {}).title || '🎯 Best Model Accuracy Track Prize: $2,000'}</h4>
                    <p style="color: var(--text-muted); font-size: 1rem; margin: 0; line-height: 1.5;">${(podium.track || {}).desc || 'Awarded to the team that achieves the highest test-set benchmark accuracy on our secret evaluation dataset!'}</p>
                </div>
                ${customPrizes.map(prize => `
                    <div class="glass-card animate-in" style="padding: 1.5rem; border-color: #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.15); display: flex; justify-content: space-between; align-items: center; gap: 1.5rem;">
                        <div style="text-align: left; flex-grow: 1;">
                            <h4 style="color: #f59e0b; font-size: 1.3rem; margin-bottom: 0.4rem; font-weight: 800;">✨ ${prize.title}</h4>
                            ${prize.desc ? `<p style="color: var(--text-main); font-size: 1rem; margin: 0; line-height: 1.6;">${prize.desc}</p>` : ''}
                        </div>
                        <div style="background: rgba(245, 158, 11, 0.15); border: 2px solid #f59e0b; color: #fff; padding: 0.6rem 1.4rem; border-radius: 9999px; font-weight: 900; font-size: 1.4rem; text-shadow: 0 0 10px rgba(245, 158, 11, 0.5); flex-shrink: 0;">
                            ${prize.amount}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        timelineContent.appendChild(prizesContainer);

        // 3. Render Sponsors section directly below Champion Prizes when scrolling down!
        const sponsorsContainer = document.createElement('div');
        sponsorsContainer.style.width = '100%';
        sponsorsContainer.style.gridColumn = '1 / -1';
        sponsorsContainer.style.marginTop = '4.5rem';
        sponsorsContainer.style.paddingTop = '3.5rem';
        sponsorsContainer.style.borderTop = '2px dashed #a855f7';
        sponsorsContainer.className = 'animate-in';
        sponsorsContainer.innerHTML = `
            <div class="section-header" style="margin-bottom: 2.5rem;">
                <span class="section-subtitle" style="color: #c084fc;">Ecosystem Partners</span>
                <h2 class="section-title">Our <span class="text-gradient">Sponsors</span></h2>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Supported by industry pioneers in artificial intelligence and machine learning.</p>
            </div>

            <div class="sponsors-tier">
                <h3 class="tier-title">✦ Titanium AI Partners ✦</h3>
                <div class="sponsors-grid">
                    <div class="glass-card sponsor-logo">💎 DeepMind AI</div>
                    <div class="glass-card sponsor-logo" style="border-color: var(--accent-cyan); color: #fff;">🟢 NVIDIA AI</div>
                    <div class="glass-card sponsor-logo">🚀 OpenAI Lab</div>
                </div>
            </div>

            <div class="sponsors-tier" style="margin-bottom: 2.5rem;">
                <h3 class="tier-title">✦ Gold & Community Sponsors ✦</h3>
                <div class="sponsors-grid">
                    <div class="glass-card sponsor-logo" style="font-size: 1.2rem; padding: 1rem 2rem;">🤗 Hugging Face</div>
                    <div class="glass-card sponsor-logo" style="font-size: 1.2rem; padding: 1rem 2rem;">🔥 PyTorch Org</div>
                    <div class="glass-card sponsor-logo" style="font-size: 1.2rem; padding: 1rem 2rem;">🐙 GitHub Campus</div>
                    <div class="glass-card sponsor-logo" style="font-size: 1.2rem; padding: 1rem 2rem; border-color: var(--accent-purple);">🛰️ Data Science Club</div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 3.5rem; border-top: 1px dashed var(--border-glow); padding-top: 2.5rem;">
                <button onclick="window.returnToLiveFeed()" style="background: rgba(0, 242, 254, 0.12); border: 1px solid #00f2fe; color: #00f2fe; padding: 0.8rem 2.2rem; border-radius: 6px; cursor: pointer; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 1.05rem; transition: all 0.2s; box-shadow: 0 0 20px rgba(0, 242, 254, 0.2);">
                    🔙 Return to Live Events Feed
                </button>
            </div>
        `;
        timelineContent.appendChild(sponsorsContainer);

        if (scroll && timelineContent) {
            const sec = document.getElementById('schedule');
            if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Default load: Only Live Events shown! No schedule tabs shown until an event is clicked!
    renderLiveFeed();
}

/* =========================================================
   4. FAQ ACCORDION ENGINE
========================================================= */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close all others for clean UX
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* =========================================================
   5. REAL-TIME FORM VALIDATION & CONFETTI SUCCESS MODAL
========================================================= */
function initFormValidation() {
    const form = document.getElementById('registrationForm');
    const modal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');

    if (!form) return;

    const fields = [
        { id: 'teamName', validator: (val) => val.trim().length >= 2 },
        { id: 'email', validator: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) },
        { id: 'track', validator: (val) => val !== '' },
        { id: 'teamSize', validator: (val) => val !== '' },
        { id: 'terms', type: 'checkbox', validator: (el) => el.checked }
    ];

    // Optional field validation
    const githubInput = document.getElementById('github');
    githubInput.addEventListener('blur', () => {
        const val = githubInput.value.trim();
        const group = githubInput.closest('.form-group');
        if (val !== '' && !/^(http|https):\/\/[^ "]+$/.test(val)) {
            group.classList.add('invalid');
            githubInput.classList.add('error');
        } else {
            group.classList.remove('invalid');
            githubInput.classList.remove('error');
        }
    });

    // Live feedback on input/change
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        const eventName = f.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(eventName, () => {
            const isValid = f.type === 'checkbox' ? f.validator(el) : f.validator(el.value);
            const group = el.closest('.form-group');
            if (isValid) {
                group.classList.remove('invalid');
                el.classList.remove('error');
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isFormValid = true;

        fields.forEach(f => {
            const el = document.getElementById(f.id);
            const isValid = f.type === 'checkbox' ? f.validator(el) : f.validator(el.value);
            const group = el.closest('.form-group');
            
            if (!isValid) {
                group.classList.add('invalid');
                if (el.classList.contains('form-control')) el.classList.add('error');
                isFormValid = false;
            } else {
                group.classList.remove('invalid');
                if (el.classList.contains('form-control')) el.classList.remove('error');
            }
        });

        // Check optional github input
        if (githubInput.value.trim() !== '' && !/^(http|https):\/\/[^ "]+$/.test(githubInput.value.trim())) {
            githubInput.closest('.form-group').classList.add('invalid');
            githubInput.classList.add('error');
            isFormValid = false;
        }

        if (isFormValid) {
            // Trigger Celebratory Success Modal
            modal.classList.add('active');
            form.reset();
        } else {
            // Scroll smoothly to first invalid group
            const firstInvalid = document.querySelector('.form-group.invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

/* =========================================================
   6. DARK / LIGHT CYBER THEME TOGGLE ENGINE
========================================================= */
function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('hackorbit_theme') || 'dark';

    if (savedTheme === 'light') {
        root.setAttribute('data-theme', 'light');
        toggleBtn.innerHTML = '☀️';
    } else {
        root.removeAttribute('data-theme');
        toggleBtn.innerHTML = '🌙';
    }

    toggleBtn.addEventListener('click', () => {
        const isLight = root.getAttribute('data-theme') === 'light';
        if (isLight) {
            root.removeAttribute('data-theme');
            toggleBtn.innerHTML = '🌙';
            localStorage.setItem('hackorbit_theme', 'dark');
        } else {
            root.setAttribute('data-theme', 'light');
            toggleBtn.innerHTML = '☀️';
            localStorage.setItem('hackorbit_theme', 'light');
        }
    });
}
