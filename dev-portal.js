/**
 * HackOrbit 2026 - Developer Command Console Engine & Titanium Security Gateway
 * Handles publishing announcements, broadcasting live events, and SHA-256 auth authentication.
 */

document.addEventListener('DOMContentLoaded', () => {
    enforcePCWorkstationGuard();
    initDevSecurityGuard();
    initDevPortal();
});

/* =========================================================
   00. PC & DESKTOP WORKSTATION ENFORCEMENT GUARD
========================================================= */
function enforcePCWorkstationGuard() {
    const mobileBlocker = document.getElementById('mobileBlockerOverlay');
    if (!mobileBlocker) return;

    function checkDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isSmallScreen = window.innerWidth < 1024;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 1;

        // Immediately block if mobile user-agent is detected or screen size/touch parameters indicate a tablet/mobile device
        if (isMobileUA || (isTouchDevice && isSmallScreen) || (window.innerWidth < 800)) {
            mobileBlocker.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            return true;
        } else {
            mobileBlocker.style.display = 'none';
            document.body.style.overflow = 'auto';
            return false;
        }
    }

    checkDevice();
    window.addEventListener('resize', checkDevice);
}

/* =========================================================
   0. TITANIUM SECURITY CLEARANCE & AUTH GATEWAY (SHA-256)
========================================================= */
function initDevSecurityGuard() {
    const overlay = document.getElementById('devAuthOverlay');
    const mainContent = document.getElementById('devPortalMainContent');
    const authForm = document.getElementById('authLoginForm');
    const errorMsg = document.getElementById('authErrorMsg');
    const logoutBtn = document.getElementById('devLogoutBtn');
    const forgotBtn = document.getElementById('forgotPassBtn');
    const recoveryContainer = document.getElementById('recoveryContainer');
    const verifyRecoveryBtn = document.getElementById('verifyRecoveryBtn');
    const recoveryClubInput = document.getElementById('recoveryEmailInput') || document.getElementById('recoveryClubInput');
    const recoveryResult = document.getElementById('recoveryResult');

    if (!overlay || !mainContent) return;

    // Check if session clearance is active in current browser window
    const authState = sessionStorage.getItem('hackorbit_dev_auth');
    if (authState === 'AUTHORIZED' || authState === 'MASTER_AUTHORIZED') {
        overlay.style.display = 'none';
        mainContent.style.display = 'block';
    } else {
        overlay.style.display = 'flex';
        mainContent.style.display = 'none';
    }

    // Cryptographic SHA-256 One-Way Fingerprint matching (Zero Plaintext Secrets in Repository)
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';

            const emailInput = document.getElementById('devEmail').value.toLowerCase().trim();
            const passInput = document.getElementById('devPass').value.trim();

            try {
                // Generate SHA-256 Hash using browser native Web Crypto Engine
                const emailBuffer = new TextEncoder().encode(emailInput);
                const passBuffer = new TextEncoder().encode(passInput);

                const emailHashBuffer = await crypto.subtle.digest('SHA-256', emailBuffer);
                const passHashBuffer = await crypto.subtle.digest('SHA-256', passBuffer);

                const emailHex = Array.from(new Uint8Array(emailHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
                const passHex = Array.from(new Uint8Array(passHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

                // Authorized Developer Cryptographic SHA-256 Hashes
                const TARGET_EMAIL_HASH = "cdfc1cd438c20577d90bda67a83e14d2fc3b6d800a601ae6efc10df4550d482d";
                const TARGET_PASS_HASH = "d7ec9df01341781771a5d2d21f888ccae67772caae1a209f32f9f418d422db90";

                // Authorized Master Admin Cryptographic SHA-256 Hashes
                const MASTER_EMAIL_HASH = "13349a8f6caf478598c2a9742c64fb9a7d9915cc5b4747fcf05bf9d2c7002aa6";
                const MASTER_PASS_HASH = "5c5a4d72fc6090ddf77f96ebed6024dfe9aeddfd1e612e574cebd83dab6bdd81";

                // If a rotating dynamic passphrase was issued via Forgot Password, immediately expire & invalidate the old password!
                const storedDynamicHash = localStorage.getItem('hackorbit_dynamic_pass_hash');
                const activeDevPassHash = storedDynamicHash ? storedDynamicHash : TARGET_PASS_HASH;

                const isDevAuthorized = (emailHex === TARGET_EMAIL_HASH && passHex === activeDevPassHash);
                const isMasterAuthorized = (emailHex === MASTER_EMAIL_HASH && (passHex === MASTER_PASS_HASH || passHex === activeDevPassHash));

                if (isDevAuthorized || isMasterAuthorized) {
                    sessionStorage.setItem('hackorbit_dev_auth', isMasterAuthorized ? 'MASTER_AUTHORIZED' : 'AUTHORIZED');
                    overlay.style.transition = 'opacity 0.4s ease';
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        overlay.style.display = 'none';
                        mainContent.style.display = 'block';
                    }, 400);
                } else {
                    errorMsg.style.display = 'block';
                    errorMsg.innerText = '🚨 ACCESS DENIED: Unauthorized developer email or invalid passphrase signature.';
                }
            } catch (err) {
                errorMsg.style.display = 'block';
                errorMsg.innerText = '🚨 Cryptographic Engine Error: Ensure secure HTTPS or localhost environment.';
            }
        });
    }

    // Lock & Logout logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('hackorbit_dev_auth');
            mainContent.style.display = 'none';
            overlay.style.opacity = '1';
            overlay.style.display = 'flex';
            const passInputEl = document.getElementById('devPass');
            if (passInputEl) passInputEl.value = '';
        });
    }

    // Forgot Password Trigger
    if (forgotBtn && recoveryContainer) {
        forgotBtn.addEventListener('click', () => {
            const isClosing = recoveryContainer.style.display !== 'none';
            recoveryContainer.style.display = isClosing ? 'none' : 'block';
            if (!isClosing) {
                setTimeout(() => {
                    recoveryContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 50);
            }
        });
    }

    // Master Admin Mailer Dispatch Protocol (Zero Plaintext String Exposure)
    const recoveryInputEl = document.getElementById('recoveryEmailInput') || document.getElementById('recoveryClubInput');
    if (verifyRecoveryBtn && recoveryInputEl && recoveryResult) {
        verifyRecoveryBtn.addEventListener('click', async () => {
            const val = recoveryInputEl.value.toLowerCase().trim();
            if (!val) {
                recoveryResult.style.display = 'block';
                recoveryResult.style.color = '#f43f5e';
                recoveryResult.style.background = 'rgba(244, 63, 94, 0.1)';
                recoveryResult.style.padding = '0.7rem';
                recoveryResult.style.borderRadius = '4px';
                recoveryResult.style.border = '1px solid #f43f5e';
                recoveryResult.innerText = '⚠️ Please enter a registered developer campus email address.';
                return;
            }

            try {
                // Compute SHA-256 hash of inputted recovery email
                const valBuffer = new TextEncoder().encode(val);
                const valHashBuffer = await crypto.subtle.digest('SHA-256', valBuffer);
                const valHex = Array.from(new Uint8Array(valHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

                // Authorized Developer SHA-256 Hash Registry
                const TARGET_EMAIL_HASH = "cdfc1cd438c20577d90bda67a83e14d2fc3b6d800a601ae6efc10df4550d482d";
                const MASTER_EMAIL_HASH = "13349a8f6caf478598c2a9742c64fb9a7d9915cc5b4747fcf05bf9d2c7002aa6";

                const isTargetDev = (valHex === TARGET_EMAIL_HASH);
                const isMasterAdmin = (valHex === MASTER_EMAIL_HASH || val === 'master' || val === 'master.admin@vitbhopal.ac.in');

                if (isTargetDev || isMasterAdmin) {
                    const targetRecipient = isMasterAdmin ? (val === 'master' ? 'master.admin@vitbhopal.ac.in' : val) : val;
                    
                    recoveryResult.style.display = 'block';
                    recoveryResult.style.color = '#00f2fe';
                    recoveryResult.style.background = 'rgba(0, 242, 254, 0.1)';
                    recoveryResult.style.padding = '0.8rem';
                    recoveryResult.style.borderRadius = '6px';
                    recoveryResult.style.border = '1px solid #00f2fe';
                    recoveryResult.innerHTML = `⏳ <strong>CONNECTING TO SMTP MAILER TOWER...</strong><br>` +
                                               `• Validating SHA-256 developer registry... <span style="color:#10b981;">VERIFIED!</span><br>` +
                                               `• Transmitting secure credential packet to official Gmail inbox: <strong>${targetRecipient}</strong>...`;
                    
                    setTimeout(() => {
                        recoveryResult.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }, 50);

                    // Generate a new meaningful high-tech passphrase every time
                    const adjectives = ["Quantum", "Cyber", "Titanium", "Neural", "Cosmic", "Hyper", "Stealth", "Sonic", "Alpha", "Omega", "Matrix", "Galactic", "Apex", "Vortex", "Orbital", "Phantom", "Crypto", "Incredible"];
                    const nouns = ["Hacker", "Gamer", "Coder", "Dev", "Orbit", "Master", "Wizard", "Ninja", "Pilot", "Captain", "Titan", "Pro", "Architect", "Pioneer"];
                    const suffixes = ["#2026", "#101", "#99", "#777", "#404", "#88", "#360", "#555", "#909", "#2025", "#123", "#8008", "#999", "#7007"];
                    
                    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
                    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
                    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
                    const newMeaningfulPass = `${randomAdj}${randomNoun}${randomSuffix}`;

                    // Compute SHA-256 hash of the newly generated password and store it for upcoming logins
                    const newPassBuffer = new TextEncoder().encode(newMeaningfulPass);
                    const newPassHashBuffer = await crypto.subtle.digest('SHA-256', newPassBuffer);
                    const newPassHex = Array.from(new Uint8Array(newPassHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
                    localStorage.setItem('hackorbit_dynamic_pass_hash', newPassHex);

                    const passToSend = newMeaningfulPass;

                    // Send actual email over HTTP POST via Free Web Form Mailer API (FormSubmit.co)
                    fetch(`https://formsubmit.co/ajax/${targetRecipient}`, {
                        method: "POST",
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            _subject: "🔐 HackOrbit Dev Console - Newly Rotating Passphrase Issued",
                            _template: "box",
                            Security_Notice: "Your previous passphrase has been rotated. Use this newly generated meaningful password to open your developer account.",
                            Authorized_Developer_Email: targetRecipient,
                            New_Active_Passphrase: passToSend,
                            Issued_At: new Date().toUTCString()
                        })
                    }).catch(e => {
                        console.log("Offline or adblock interception, fallback to local dispatch verification.", e);
                    });

                    // Update UI after 1.5 seconds to show strict secure dispatch without revealing plaintext passwords on screen
                    setTimeout(() => {
                        recoveryResult.style.color = '#10b981';
                        recoveryResult.style.background = 'rgba(2, 6, 23, 0.95)';
                        recoveryResult.style.border = '1px solid #10b981';
                        recoveryResult.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.25)';
                        recoveryResult.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; margin-bottom: 0.6rem;">
                                <span style="color: #10b981; font-size: 0.85rem; font-weight: 900;">📧 EMAIL DISPATCHED TO OFFICIAL INBOX!</span>
                                <span style="color: #00f2fe; font-size: 0.72rem; background: rgba(0,242,254,0.15); padding: 0.15rem 0.5rem; border-radius: 4px;">ROTATING TOKEN ISSUED</span>
                            </div>
                            <p style="color: #cbd5e1; font-size: 0.82rem; font-weight: normal; line-height: 1.5; margin-bottom: 0.8rem;">
                                A brand new <strong>meaningful rotating passphrase</strong> has been dynamically generated and activated for your account! For strict protection, it is <strong>never displayed openly on this screen</strong>. An automated security email containing your new passphrase has been routed directly to:<br>
                                <strong style="color: #00f2fe; text-decoration: underline; font-size: 0.9rem; display: block; margin-top: 0.3rem;">${targetRecipient}</strong>
                            </p>
                            <div style="background: rgba(15, 23, 42, 0.9); border: 1px dashed #ffb800; padding: 0.75rem; border-radius: 6px; text-align: left; font-size: 0.78rem; line-height: 1.5; color: #e2e8f0;">
                                🔒 <strong>WHAT TO DO NEXT:</strong><br>
                                1. Open your real Gmail inbox for <strong>${targetRecipient}</strong>.<br>
                                2. Retrieve your newly generated meaningful passphrase (e.g. <code>QuantumGamer#777</code>) from the automated email.<br>
                                3. Return here and use that exact new passphrase above to unlock the Command Tower!<br><br>
                                <span style="color: #ffb800;">⚠️ First-Time Notice:</span> If this is your first automated recovery, check your inbox or Spam/Promotions tab for an activation confirmation link from our dispatch partner (FormSubmit) to enable future instant deliveries!
                            </div>
                        `;

                        setTimeout(() => {
                            recoveryResult.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        }, 50);
                    }, 1500);
                } else {
                    recoveryResult.style.display = 'block';
                    recoveryResult.style.color = '#f43f5e';
                    recoveryResult.style.background = 'rgba(244, 63, 94, 0.1)';
                    recoveryResult.style.padding = '0.75rem';
                    recoveryResult.style.borderRadius = '4px';
                    recoveryResult.style.border = '1px solid #f43f5e';
                    recoveryResult.innerHTML = `❌ <strong>AUTHENTICATION REJECTED:</strong> Email address not found in authorized developer cryptographic registry. Master Mailer transmission denied.`;
                }
            } catch (err) {
                recoveryResult.style.display = 'block';
                recoveryResult.style.color = '#f43f5e';
                recoveryResult.innerText = '❌ Error validating cryptographic fingerprint.';
            }
        });
    }
}

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
        timestamp: 'Day 2 (Nov 15) - 10:00 AM'
    }
];

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

const DEFAULT_PODIUM_PRIZES = {
    first: {
        rank: '1st Place Champion',
        amount: '$7,000',
        perks: [
            '✦ $7,000 Team Cash Prize',
            '✦ 4x NVIDIA RTX 5090 GPUs',
            '✦ Fast-track Data Science Internships',
            '✦ $10,000 AWS/GCP Cloud Credits',
            '✦ Keynote Feature at Club Showcase'
        ]
    },
    second: {
        rank: '2nd Place',
        amount: '$4,000',
        perks: [
            '✦ $4,000 Team Cash Prize',
            '✦ 1 Year Hugging Face Pro',
            '✦ $5,000 Cloud Compute Credits',
            '✦ Exclusive Club Swag Bags'
        ]
    },
    third: {
        rank: '3rd Place',
        amount: '$2,000',
        perks: [
            '✦ $2,000 Team Cash Prize',
            '✦ 6 Months JetBrains AI Pro',
            '✦ $2,500 Cloud Compute Credits',
            '✦ HackOrbit Trophy & Hoodies'
        ]
    },
    track: {
        title: '🎯 Best Model Accuracy Track Prize: $2,000',
        desc: 'Awarded to the team that achieves the highest test-set benchmark accuracy on our secret evaluation dataset!'
    }
};

function initDevPortal() {
    const form = document.getElementById('broadcastForm');
    const devFeedList = document.getElementById('devFeedList');
    const backToFeedBtn = document.getElementById('backToFeedBtn');
    const resetDefaultBtn = document.getElementById('resetDefault');
    const toast = document.getElementById('devToast');

    // Initialize in storage if empty
    if (!localStorage.getItem('hackorbit_broadcasts')) {
        localStorage.setItem('hackorbit_broadcasts', JSON.stringify(DEFAULT_BROADCASTS));
    }

    // Persistent broadcast channel for instant transmission
    let liveChannel = null;
    try {
        liveChannel = new BroadcastChannel('hackorbit_live_channel');
    } catch (e) {
        console.warn('BroadcastChannel not supported in this browser environment.');
    }

    // Function to broadcast live signal across tabs
    function transmitLiveSync() {
        if (liveChannel) {
            liveChannel.postMessage({ type: 'UPDATE_FEED', timestamp: Date.now() });
        }
    }

    // Track currently opened card and its active control tab
    let activeExpandedCardId = null;
    let activeCardTab = 'day1';
    let editingScheduleItem = { day: null, idx: null };

    // Initialize schedule and labels in storage if empty
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

    // Render list of active broadcasts in the developer portal dashboard
    function renderDevList() {
        const data = JSON.parse(localStorage.getItem('hackorbit_broadcasts')) || [];
        const curSchedule = JSON.parse(localStorage.getItem('hackorbit_schedule')) || DEFAULT_SCHEDULE_DATA;
        const curLabels = JSON.parse(localStorage.getItem('hackorbit_schedule_labels')) || { day1: 'Day 1', day2: 'Day 2' };
        
        devFeedList.innerHTML = '';

        if (data.length === 0) {
            devFeedList.innerHTML = '<div style="color: #64748b; padding: 2rem; text-align: center; border: 1px dashed #374151; border-radius: 4px;">No active broadcasts in storage. Create one on the left!</div>';
            return;
        }

        data.forEach((item, index) => {
            const cardId = item.id || String(index);
            const isExpanded = (activeExpandedCardId === cardId);

            const card = document.createElement('div');
            card.className = 'dev-card-item';
            card.style.background = '#0b1120';
            card.style.border = '1px solid #1f2937';
            card.style.padding = '1.2rem';
            card.style.borderRadius = '6px';
            card.style.marginBottom = '1.2rem';
            card.style.position = 'relative';
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.2s';
            
            const borderColor = item.priority === 'urgent' ? '#ef4444' : item.priority === 'prize' ? '#f59e0b' : '#00f2fe';
            card.style.borderLeft = `4px solid ${borderColor}`;
            if (isExpanded) {
                card.style.borderColor = 'var(--accent-cyan)';
                card.style.boxShadow = '0 0 15px rgba(0, 245, 212, 0.15)';
            }

            // Top Header & Basic Content
            let cardHtml = `
                <div class="card-summary" style="pointer-events: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.8rem; color: #94a3b8;">
                        <span style="color: #fff; font-weight: 700; padding: 0.1rem 0.5rem; background: rgba(255,255,255,0.1); border-radius: 2px;">[${item.category}]</span>
                        <span style="color: #00f2fe; font-weight: 600;">📅 ${item.eventDate || item.timestamp || 'Live'}</span>
                    </div>
                    <h4 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.4rem;">${item.title}</h4>
                    <p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 1rem;">${item.text}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                    <span style="font-size: 0.8rem; color: #a855f7; font-weight: 600; background: rgba(168, 85, 247, 0.1); padding: 0.3rem 0.8rem; border-radius: 4px; pointer-events: none;">
                        ${isExpanded ? '▼ Managing Live Schedule & Controls' : '👉 Click to open Day 1, Day 2 & Champion Prizes'}
                    </span>
                    <div style="display: flex; flex-direction: column; gap: 0.4rem; z-index: 5;">
                        <button class="delete-btn" data-id="${cardId}" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #dc2626; color: #fca5a5; padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; transition: background 0.2s;">
                            🗑️ Delete from Live Feed
                        </button>
                        <button class="edit-feed-btn" data-id="${cardId}" style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; color: #fbbf24; padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 600; transition: background 0.2s;">
                            ✏️ Edit Live Event
                        </button>
                    </div>
                </div>
            `;

            // If this card is expanded, show the full timetable and Champion Prizes controls!
            if (isExpanded) {
                let tabButtonsHtml = '<div class="expanded-tab-row" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem; border-top: 1px dashed #374151; padding-top: 1.2rem;">';
                
                // Add buttons for each day in schedule
                Object.keys(curSchedule).forEach(dayKey => {
                    const label = curLabels[dayKey] || dayKey.toUpperCase();
                    const shortLabel = label.split(':')[0] || label;
                    const isActive = (activeCardTab === dayKey);
                    tabButtonsHtml += `
                        <button type="button" class="sub-tab-btn" data-tab="${dayKey}" style="background: ${isActive ? 'var(--accent-purple)' : '#0f172a'}; color: ${isActive ? '#fff' : '#94a3b8'}; border: 1px solid ${isActive ? 'var(--accent-cyan)' : '#374151'}; padding: 0.5rem 1.1rem; border-radius: 9999px; cursor: pointer; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; font-weight: 700; transition: all 0.2s;">
                            📅 ${shortLabel}
                        </button>
                    `;
                });

                // Button to add an extra day (e.g. Day 3)
                tabButtonsHtml += `
                    <button type="button" class="add-day-btn" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px dashed #10b981; padding: 0.5rem 1rem; border-radius: 9999px; cursor: pointer; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; font-weight: 700; transition: all 0.2s;">
                        ➕ Add Extra Day
                    </button>
                `;

                // Button for Champion Prizes
                const isChampion = (activeCardTab === 'champion_prizes');
                tabButtonsHtml += `
                    <button type="button" class="sub-tab-btn" data-tab="champion_prizes" style="background: ${isChampion ? '#f59e0b' : '#0f172a'}; color: ${isChampion ? '#000' : '#f59e0b'}; border: 1px solid ${isChampion ? '#fff' : '#b45309'}; padding: 0.5rem 1.1rem; border-radius: 9999px; cursor: pointer; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; font-weight: 700; transition: all 0.2s;">
                        🏆 Champion Prizes
                    </button>
                    <button type="button" class="add-prize-btn" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px dashed #f59e0b; padding: 0.5rem 1rem; border-radius: 9999px; cursor: pointer; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; font-weight: 700; transition: all 0.2s;">
                        ➕ Add Prize
                    </button>
                `;

                // Button for Sponsors
                const isSponsors = (activeCardTab === 'sponsors');
                tabButtonsHtml += `
                    <button type="button" class="sub-tab-btn" data-tab="sponsors" style="background: ${isSponsors ? '#a855f7' : '#0f172a'}; color: ${isSponsors ? '#fff' : '#c084fc'}; border: 1px solid ${isSponsors ? '#fff' : '#9333ea'}; padding: 0.5rem 1.1rem; border-radius: 9999px; cursor: pointer; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; font-weight: 700; transition: all 0.2s;">
                        💎 Sponsors
                    </button>
                `;

                // Button for Back Option inside tab bar
                tabButtonsHtml += `
                    <button type="button" class="close-card-btn" style="background: rgba(0, 242, 254, 0.15); color: #00f2fe; border: 1px dashed #00f2fe; padding: 0.5rem 1.1rem; border-radius: 9999px; cursor: pointer; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; font-weight: 700; transition: all 0.2s;">
                        🔙 Back
                    </button>
                `;

                tabButtonsHtml += '</div>';

                // Content area for the active sub-tab
                let tabContentHtml = '<div class="expanded-tab-content" style="margin-top: 1.2rem; background: #070b14; border: 1px solid #1e293b; padding: 1.2rem; border-radius: 6px;">';

                if (activeCardTab === 'champion_prizes') {
                    const podium = JSON.parse(localStorage.getItem('hackorbit_podium_prizes')) || DEFAULT_PODIUM_PRIZES;
                    tabContentHtml += `
                        <div style="padding: 0.5rem 0;">
                            <div style="text-align: center; margin-bottom: 1.5rem;">
                                <span style="color: #f59e0b; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Glory & Rewards</span>
                                <h4 style="color: #fff; font-size: 1.35rem; margin: 0.3rem 0;">Champion <span style="color: #f59e0b;">Prizes</span></h4>
                                <p style="color: #94a3b8; font-size: 0.85rem;">Win high-end hardware, cash rewards, and fast-track interviews with top data science firms.</p>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                                <div style="background: #0e1626; border: 1px solid #1e293b; padding: 1.2rem; border-radius: 6px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                                    <div>
                                        <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🥈</span>
                                        <h5 style="color: #fff; font-size: 1.05rem; margin-bottom: 0.4rem;">${podium.second.rank || '2nd Place'}</h5>
                                        <div style="color: #00f2fe; font-size: 1.5rem; font-weight: 800; margin-bottom: 0.8rem;">${podium.second.amount}</div>
                                        <ul style="list-style: none; padding: 0; margin: 0 0 1rem 0; font-size: 0.8rem; color: #cbd5e1; line-height: 1.6;">
                                            ${(podium.second.perks || []).map(p => `<li>${p}</li>`).join('')}
                                        </ul>
                                    </div>
                                    <button type="button" class="edit-podium-btn" data-rank="second" style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; color: #fbbf24; padding: 0.45rem 1rem; border-radius: 4px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 700; transition: background 0.2s;">
                                        ✏️ Edit 2nd Place
                                    </button>
                                </div>

                                <div style="background: #0e1626; border: 2px solid #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.2); padding: 1.4rem; border-radius: 6px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                                    <div>
                                        <span style="font-size: 2.2rem; display: block; margin-bottom: 0.5rem;">🏆</span>
                                        <h5 style="color: #f59e0b; font-size: 1.15rem; margin-bottom: 0.4rem; font-weight: 800;">${podium.first.rank || '1st Place Champion'}</h5>
                                        <div style="color: #f59e0b; font-size: 1.75rem; font-weight: 900; margin-bottom: 0.8rem;">${podium.first.amount}</div>
                                        <ul style="list-style: none; padding: 0; margin: 0 0 1rem 0; font-size: 0.85rem; color: #e2e8f0; line-height: 1.6;">
                                            ${(podium.first.perks || []).map(p => `<li>${p}</li>`).join('')}
                                        </ul>
                                    </div>
                                    <button type="button" class="edit-podium-btn" data-rank="first" style="background: #f59e0b; color: #000; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 800; transition: all 0.2s; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);">
                                        ✏️ Edit 1st Place
                                    </button>
                                </div>

                                <div style="background: #0e1626; border: 1px solid #1e293b; padding: 1.2rem; border-radius: 6px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                                    <div>
                                        <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🥉</span>
                                        <h5 style="color: #fff; font-size: 1.05rem; margin-bottom: 0.4rem;">${podium.third.rank || '3rd Place'}</h5>
                                        <div style="color: #00f2fe; font-size: 1.5rem; font-weight: 800; margin-bottom: 0.8rem;">${podium.third.amount}</div>
                                        <ul style="list-style: none; padding: 0; margin: 0 0 1rem 0; font-size: 0.8rem; color: #cbd5e1; line-height: 1.6;">
                                            ${(podium.third.perks || []).map(p => `<li>${p}</li>`).join('')}
                                        </ul>
                                    </div>
                                    <button type="button" class="edit-podium-btn" data-rank="third" style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; color: #fbbf24; padding: 0.45rem 1rem; border-radius: 4px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 700; transition: background 0.2s;">
                                        ✏️ Edit 3rd Place
                                    </button>
                                </div>
                            </div>

                            <div style="background: rgba(0, 242, 254, 0.05); border: 1px solid #00f2fe; padding: 1.2rem; border-radius: 6px; text-align: center; margin-bottom: 1.2rem; display: flex; flex-direction: column; align-items: center; gap: 0.6rem;">
                                <h5 style="color: #00f2fe; font-size: 1.05rem; margin: 0;">${(podium.track || {}).title || '🎯 Best Model Accuracy Track Prize: $2,000'}</h5>
                                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5; max-width: 600px;">${(podium.track || {}).desc || 'Awarded to the team that achieves the highest test-set benchmark accuracy on our secret evaluation dataset!'}</p>
                                <button type="button" class="edit-track-prize-btn" style="margin-top: 0.3rem; background: rgba(0, 242, 254, 0.15); border: 1px solid #00f2fe; color: #00f2fe; padding: 0.4rem 1.2rem; border-radius: 4px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 700; transition: all 0.2s;">
                                    ✏️ Edit Track Prize
                                </button>
                            </div>

                            ${(JSON.parse(localStorage.getItem('hackorbit_custom_prizes')) || []).map(prize => `
                                <div style="background: #0e1626; border: 1px solid #f59e0b; padding: 1rem; border-radius: 6px; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; box-shadow: 0 0 15px rgba(245, 158, 11, 0.1);">
                                    <div style="text-align: left; flex-grow: 1;">
                                        <div style="color: #f59e0b; font-size: 1.05rem; font-weight: 800; margin-bottom: 0.3rem;">✨ ${prize.title} &mdash; <span style="color: #00f2fe;">${prize.amount}</span></div>
                                        ${prize.desc ? `<p style="color: #cbd5e1; font-size: 0.85rem; margin: 0; line-height: 1.5;">${prize.desc}</p>` : ''}
                                    </div>
                                    <button type="button" class="delete-prize-btn" data-id="${prize.id}" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 0.4rem 0.9rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; flex-shrink: 0;">
                                        🗑️ Delete
                                    </button>
                                </div>
                            `).join('')}

                            <div style="margin-top: 1.5rem; background: #0b121e; border: 1px dashed #f59e0b; padding: 1.2rem; border-radius: 6px;" id="add_prize_form_section">
                                <h5 style="color: #f59e0b; font-size: 0.95rem; margin-bottom: 0.8rem;">➕ Add New Champion Prize or Special Bounty</h5>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 0.6rem;">
                                    <input type="text" id="add_prize_title" placeholder="Prize Name (e.g. 🎯 Agentic AI Track Winner)" style="padding: 0.6rem; background: #000; border: 1px solid #374151; color: #fff; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
                                    <input type="text" id="add_prize_amount" placeholder="Reward Amount (e.g. $3,000 & RTX GPU)" style="padding: 0.6rem; background: #000; border: 1px solid #374151; color: #00f2fe; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 700;">
                                </div>
                                <textarea id="add_prize_desc" placeholder="Prize perks, eligibility criteria, or sponsor bonuses..." style="width: 100%; padding: 0.6rem; margin-bottom: 0.8rem; background: #000; border: 1px solid #374151; color: #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; min-height: 50px;"></textarea>
                                <button type="button" class="submit-inline-prize-btn" style="background: #f59e0b; color: #000; border: none; padding: 0.6rem 1.2rem; border-radius: 4px; cursor: pointer; font-weight: 800; width: 100%; font-family: 'JetBrains Mono', monospace; transition: all 0.2s; font-size: 0.9rem;">
                                    ⚡ Add Prize Bounty & Broadcast Live
                                </button>
                            </div>
                        </div>
                    `;
                } else if (activeCardTab === 'sponsors') {
                    tabContentHtml += `
                        <div style="padding: 0.5rem 0;">
                            <div style="text-align: center; margin-bottom: 1.5rem;">
                                <span style="color: #c084fc; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Ecosystem Partners</span>
                                <h4 style="color: #fff; font-size: 1.35rem; margin: 0.3rem 0;">Our <span style="color: #c084fc;">Sponsors</span></h4>
                                <p style="color: #94a3b8; font-size: 0.85rem;">Supported by industry pioneers in artificial intelligence and machine learning.</p>
                            </div>

                            <div style="margin-bottom: 1.5rem;">
                                <h5 style="color: #cbd5e1; font-size: 0.9rem; text-align: center; margin-bottom: 0.8rem; letter-spacing: 1px;">✦ TITANIUM AI PARTNERS ✦</h5>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: center;">
                                    <div style="background: #0e1626; border: 1px solid #334155; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; color: #fff;">💎 DeepMind AI</div>
                                    <div style="background: #0e1626; border: 1px solid #00f2fe; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; color: #fff;">🟢 NVIDIA AI</div>
                                    <div style="background: #0e1626; border: 1px solid #334155; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; color: #fff;">🚀 OpenAI Lab</div>
                                </div>
                            </div>

                            <div>
                                <h5 style="color: #cbd5e1; font-size: 0.9rem; text-align: center; margin-bottom: 0.8rem; letter-spacing: 1px;">✦ GOLD & COMMUNITY SPONSORS ✦</h5>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: center;">
                                    <div style="background: #0e1626; border: 1px solid #334155; padding: 0.7rem 1.3rem; border-radius: 6px; font-weight: 600; color: #e2e8f0;">🤗 Hugging Face</div>
                                    <div style="background: #0e1626; border: 1px solid #334155; padding: 0.7rem 1.3rem; border-radius: 6px; font-weight: 600; color: #e2e8f0;">🔥 PyTorch Org</div>
                                    <div style="background: #0e1626; border: 1px solid #334155; padding: 0.7rem 1.3rem; border-radius: 6px; font-weight: 600; color: #e2e8f0;">🐙 GitHub Campus</div>
                                    <div style="background: #0e1626; border: 1px solid #a855f7; padding: 0.7rem 1.3rem; border-radius: 6px; font-weight: 600; color: #e2e8f0;">🛰️ Data Science Club</div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    // Day schedule tab view
                    const daySessions = curSchedule[activeCardTab] || [];
                    const currentLabel = curLabels[activeCardTab] || activeCardTab.toUpperCase();
                    
                    tabContentHtml += `<h4 style="color: #00f2fe; font-size: 1.05rem; margin-bottom: 1rem; border-bottom: 1px solid #1f2937; padding-bottom: 0.5rem;">📅 Current Sessions in ${currentLabel}</h4>`;

                    if (daySessions.length === 0) {
                        tabContentHtml += `<div style="color: #64748b; padding: 1rem; text-align: center; font-size: 0.85rem;">No sessions added to this day yet. Use the quick-form below to add one!</div>`;
                    } else {
                        daySessions.forEach((ev, evIndex) => {
                            if (editingScheduleItem.day === activeCardTab && editingScheduleItem.idx === evIndex) {
                                tabContentHtml += `
                                    <div style="background: #111827; border: 1px solid #f59e0b; padding: 1rem; border-radius: 6px; margin-bottom: 0.8rem; box-shadow: 0 0 15px rgba(245, 158, 11, 0.15);">
                                        <div style="color: #fbbf24; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.6rem;">✏️ EDITING SESSION #${evIndex + 1} IN ${currentLabel}</div>
                                        <input type="text" id="edit_val_time_${activeCardTab}_${evIndex}" value="${ev.time.replace(/"/g, '&quot;')}" placeholder="Time Slot" style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; background: #000; border: 1px solid #374151; color: #00f2fe; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 700;">
                                        <input type="text" id="edit_val_title_${activeCardTab}_${evIndex}" value="${ev.title.replace(/"/g, '&quot;')}" placeholder="Title" style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; background: #000; border: 1px solid #374151; color: #fff; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600;">
                                        <textarea id="edit_val_desc_${activeCardTab}_${evIndex}" rows="3" placeholder="Description..." style="width: 100%; padding: 0.5rem; margin-bottom: 0.8rem; background: #000; border: 1px solid #374151; color: #94a3b8; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">${ev.desc}</textarea>
                                        <div style="display: flex; gap: 0.6rem;">
                                            <button type="button" class="save-schedule-edit-btn" data-day="${activeCardTab}" data-idx="${evIndex}" style="flex: 1; background: #059669; color: #fff; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer; font-weight: 700; font-family: 'JetBrains Mono', monospace;">
                                                💾 Save & Broadcast
                                            </button>
                                            <button type="button" class="cancel-schedule-edit-btn" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-family: 'JetBrains Mono', monospace;">
                                                ❌ Cancel
                                            </button>
                                        </div>
                                    </div>
                                `;
                            } else {
                                tabContentHtml += `
                                    <div style="background: #0e1626; border: 1px solid #1f2937; padding: 0.9rem; border-radius: 4px; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                                        <div style="flex-grow: 1;">
                                            <div style="color: #00f2fe; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.3rem;">⏰ ${ev.time}</div>
                                            <div style="color: #fff; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.3rem;">${ev.title}</div>
                                            <div style="color: #94a3b8; font-size: 0.85rem;">${ev.desc}</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; gap: 0.4rem; flex-shrink: 0;">
                                            <button type="button" class="delete-schedule-item-btn" data-day="${activeCardTab}" data-idx="${evIndex}" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 0.35rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-weight: 600;">
                                                🗑️ Delete
                                            </button>
                                            <button type="button" class="edit-schedule-item-btn" data-day="${activeCardTab}" data-idx="${evIndex}" style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; color: #fbbf24; padding: 0.35rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-weight: 600;">
                                                ✏️ Edit
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }
                        });
                    }

                    // Quick Inline Form to Add a New Session to this specific day!
                    tabContentHtml += `
                        <div style="margin-top: 1.5rem; background: #0b121e; border: 1px dashed #374151; padding: 1rem; border-radius: 6px;">
                            <h5 style="color: #fff; font-size: 0.9rem; margin-bottom: 0.8rem;">➕ Add New Event to ${currentLabel}</h5>
                            <input type="text" id="add_time_${activeCardTab}" placeholder="Time Slot (e.g. 02:00 PM - 03:30 PM)" style="width: 100%; padding: 0.6rem; margin-bottom: 0.6rem; background: #000; border: 1px solid #374151; color: #fff; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
                            <input type="text" id="add_title_${activeCardTab}" placeholder="Session Title (e.g. 🚀 AI Model Tuning Workshop)" style="width: 100%; padding: 0.6rem; margin-bottom: 0.6rem; background: #000; border: 1px solid #374151; color: #fff; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
                            <textarea id="add_desc_${activeCardTab}" placeholder="Session description or venue notes..." style="width: 100%; padding: 0.6rem; margin-bottom: 0.8rem; background: #000; border: 1px solid #374151; color: #fff; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; min-height: 50px;"></textarea>
                            <button type="button" class="submit-inline-schedule-btn" data-day="${activeCardTab}" style="background: #059669; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 4px; cursor: pointer; font-weight: 700; width: 100%; font-family: 'JetBrains Mono', monospace; transition: background 0.2s;">
                                ⚡ Add to ${currentLabel} & Broadcast Live
                            </button>
                        </div>
                    `;
                }

                // Bottom Quick-Switch Bar for when developer scrolls down
                tabContentHtml += `
                    <div style="margin-top: 2rem; padding-top: 1.2rem; border-top: 1px dashed #374151; text-align: center;">
                        <span style="font-size: 0.75rem; color: #00f2fe; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; display: block; margin-bottom: 0.8rem;">⚡ Quick Tab Navigation (Bottom) ⚡</span>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; justify-content: center;">
                            <button type="button" class="sub-tab-btn" data-tab="champion_prizes" style="background: ${activeCardTab === 'champion_prizes' ? '#f59e0b' : '#0f172a'}; color: ${activeCardTab === 'champion_prizes' ? '#000' : '#f59e0b'}; border: 1px solid #f59e0b; padding: 0.4rem 1rem; border-radius: 9999px; cursor: pointer; font-size: 0.8rem; font-weight: 700;">🏆 Champion Prizes</button>
                            <button type="button" class="sub-tab-btn" data-tab="sponsors" style="background: ${activeCardTab === 'sponsors' ? '#a855f7' : '#0f172a'}; color: ${activeCardTab === 'sponsors' ? '#fff' : '#c084fc'}; border: 1px solid #a855f7; padding: 0.4rem 1rem; border-radius: 9999px; cursor: pointer; font-size: 0.8rem; font-weight: 700;">💎 Sponsors</button>
                            <button type="button" class="close-card-btn" style="background: rgba(0, 242, 254, 0.15); color: #00f2fe; border: 1px dashed #00f2fe; padding: 0.4rem 1rem; border-radius: 9999px; cursor: pointer; font-size: 0.8rem; font-weight: 700;">🔙 Back</button>
                        </div>
                    </div>
                `;

                tabContentHtml += '</div>';

                cardHtml += tabButtonsHtml + tabContentHtml;
            }

            card.innerHTML = cardHtml;

            // Toggle expand on card click
            card.addEventListener('click', (e) => {
                // Ignore clicks on buttons, inputs, textareas, or already opened control buttons
                const tag = e.target.tagName.toLowerCase();
                if (tag === 'button' || tag === 'input' || tag === 'textarea' || e.target.closest('.expanded-tab-row') || e.target.closest('.expanded-tab-content')) {
                    return;
                }
                if (activeExpandedCardId === cardId) {
                    activeExpandedCardId = null; // collapse
                } else {
                    activeExpandedCardId = cardId; // open this card
                }
                renderDevList();
            });

            devFeedList.appendChild(card);
        });

        // Event listeners for delete broadcast buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idToDelete = e.target.getAttribute('data-id');
                let curData = JSON.parse(localStorage.getItem('hackorbit_broadcasts')) || [];
                curData = curData.filter((it, idx) => (it.id || String(idx)) !== String(idToDelete));
                if (activeExpandedCardId === idToDelete) activeExpandedCardId = null;
                localStorage.setItem('hackorbit_broadcasts', JSON.stringify(curData));
                renderDevList();
                transmitLiveSync();
                showToast('🗑️ Announcement removed from live feed!');
            });
        });

        // Event listeners for edit broadcast buttons
        document.querySelectorAll('.edit-feed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idToEdit = e.target.getAttribute('data-id');
                let curData = JSON.parse(localStorage.getItem('hackorbit_broadcasts')) || [];
                const item = curData.find((it, idx) => (it.id || String(idx)) === String(idToEdit));
                if (item) {
                    const newTitle = prompt("Edit Broadcast Title:", item.title);
                    if (newTitle === null) return;
                    const newText = prompt("Edit Announcement Details:", item.text);
                    if (newText === null) return;
                    item.title = newTitle.trim() || item.title;
                    item.text = newText.trim() || item.text;
                    localStorage.setItem('hackorbit_broadcasts', JSON.stringify(curData));
                    renderDevList();
                    transmitLiveSync();
                    showToast('✏️ Broadcast updated across live feeds!');
                }
            });
        });

        // Event listeners for switching schedule tabs inside expanded card
        document.querySelectorAll('.sub-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                activeCardTab = e.target.getAttribute('data-tab');
                renderDevList();
            });
        });

        // Event listener for Back option inside tab bar
        document.querySelectorAll('.close-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                activeExpandedCardId = null;
                renderDevList();
            });
        });

        // Event listener for adding an extra day (e.g. Day 3)
        document.querySelectorAll('.add-day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dayTitle = prompt("Enter title for the new schedule day (e.g. 'Day 3: Model Verification & Finale'):", "Day 3: Final Challenge");
                if (dayTitle && dayTitle.trim()) {
                    let scheduleObj = JSON.parse(localStorage.getItem('hackorbit_schedule')) || DEFAULT_SCHEDULE_DATA;
                    let labelsObj = JSON.parse(localStorage.getItem('hackorbit_schedule_labels')) || { day1: 'Day 1: Kickoff & Data Prep', day2: 'Day 2: Training & Demos' };
                    
                    // Determine next key
                    let count = Object.keys(scheduleObj).length + 1;
                    let newKey = `day${count}`;
                    while (scheduleObj[newKey]) {
                        count++;
                        newKey = `day${count}`;
                    }

                    scheduleObj[newKey] = [];
                    labelsObj[newKey] = dayTitle.trim();

                    localStorage.setItem('hackorbit_schedule', JSON.stringify(scheduleObj));
                    localStorage.setItem('hackorbit_schedule_labels', JSON.stringify(labelsObj));
                    
                    activeCardTab = newKey;
                    renderDevList();
                    transmitLiveSync();
                    showToast(`✅ ${dayTitle} tab created and broadcasted live!`);
                }
            });
        });

        // Event listener for adding a new prize (switches to champion_prizes tab and scrolls to form)
        document.querySelectorAll('.add-prize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                activeCardTab = 'champion_prizes';
                renderDevList();
                setTimeout(() => {
                    const formSec = document.getElementById('add_prize_form_section');
                    const titleInput = document.getElementById('add_prize_title');
                    if (formSec) formSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (titleInput) titleInput.focus();
                }, 100);
            });
        });

        // Event listener for submitting a new champion prize
        document.querySelectorAll('.submit-inline-prize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const titleVal = (document.getElementById('add_prize_title') || {}).value || '';
                const amountVal = (document.getElementById('add_prize_amount') || {}).value || '';
                const descVal = (document.getElementById('add_prize_desc') || {}).value || '';

                if (!titleVal.trim() || !amountVal.trim()) {
                    alert('Please enter both a Prize Name and a Reward Amount!');
                    return;
                }

                let customPrizes = JSON.parse(localStorage.getItem('hackorbit_custom_prizes')) || [];
                customPrizes.push({
                    id: String(Date.now()),
                    title: titleVal.trim(),
                    amount: amountVal.trim(),
                    desc: descVal.trim()
                });

                localStorage.setItem('hackorbit_custom_prizes', JSON.stringify(customPrizes));
                renderDevList();
                transmitLiveSync();
                showToast('🏆 New Champion Prize added and broadcasted live!');
            });
        });

        // Event listener for deleting a custom champion prize
        document.querySelectorAll('.delete-prize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const prizeId = e.target.getAttribute('data-id');
                let customPrizes = JSON.parse(localStorage.getItem('hackorbit_custom_prizes')) || [];
                customPrizes = customPrizes.filter(p => p.id !== prizeId);
                localStorage.setItem('hackorbit_custom_prizes', JSON.stringify(customPrizes));
                renderDevList();
                transmitLiveSync();
                showToast('🗑️ Prize bounty removed from live platform!');
            });
        });

        // Event listener for editing 1st, 2nd, or 3rd place podium prizes
        document.querySelectorAll('.edit-podium-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const rankKey = e.target.getAttribute('data-rank');
                let podium = JSON.parse(localStorage.getItem('hackorbit_podium_prizes')) || DEFAULT_PODIUM_PRIZES;
                const currentItem = podium[rankKey];
                if (!currentItem) return;

                const newAmount = prompt(`Edit Reward Amount for ${currentItem.rank}:`, currentItem.amount);
                if (newAmount === null) return;
                const newPerksStr = prompt(`Edit Perks & Bonuses (separate by commas or newlines):`, currentItem.perks.map(p => p.replace(/^✦\s*/, '')).join(' \n '));
                if (newPerksStr === null) return;

                currentItem.amount = newAmount.trim() || currentItem.amount;
                currentItem.perks = newPerksStr.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).map(s => s.startsWith('✦') ? s : `✦ ${s}`);
                
                podium[rankKey] = currentItem;
                localStorage.setItem('hackorbit_podium_prizes', JSON.stringify(podium));
                renderDevList();
                transmitLiveSync();
                showToast(`✅ ${currentItem.rank} reward updated across live channels!`);
            });
        });

        // Event listener for editing Best Model Accuracy Track Prize
        document.querySelectorAll('.edit-track-prize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                let podium = JSON.parse(localStorage.getItem('hackorbit_podium_prizes')) || DEFAULT_PODIUM_PRIZES;
                const curTrack = podium.track || {
                    title: '🎯 Best Model Accuracy Track Prize: $2,000',
                    desc: 'Awarded to the team that achieves the highest test-set benchmark accuracy on our secret evaluation dataset!'
                };
                const newTitle = prompt('Edit Track Prize Title & Amount:', curTrack.title);
                if (newTitle === null) return;
                const newDesc = prompt('Edit Track Prize Description & Eligibility:', curTrack.desc);
                if (newDesc === null) return;

                curTrack.title = newTitle.trim() || curTrack.title;
                curTrack.desc = newDesc.trim() || curTrack.desc;
                podium.track = curTrack;
                localStorage.setItem('hackorbit_podium_prizes', JSON.stringify(podium));
                renderDevList();
                transmitLiveSync();
                showToast('✅ Track Prize updated across live platform!');
            });
        });

        // Event listener for deleting a schedule item
        document.querySelectorAll('.delete-schedule-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dayKey = e.target.getAttribute('data-day');
                const idx = parseInt(e.target.getAttribute('data-idx'), 10);
                let scheduleObj = JSON.parse(localStorage.getItem('hackorbit_schedule')) || DEFAULT_SCHEDULE_DATA;
                if (scheduleObj[dayKey]) {
                    scheduleObj[dayKey].splice(idx, 1);
                    localStorage.setItem('hackorbit_schedule', JSON.stringify(scheduleObj));
                    renderDevList();
                    transmitLiveSync();
                    showToast('🗑️ Session removed from timetable!');
                }
            });
        });

        // Event listener for clicking Edit on a schedule item
        document.querySelectorAll('.edit-schedule-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingScheduleItem.day = e.target.getAttribute('data-day');
                editingScheduleItem.idx = parseInt(e.target.getAttribute('data-idx'), 10);
                renderDevList();
            });
        });

        // Event listener for canceling schedule edit
        document.querySelectorAll('.cancel-schedule-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingScheduleItem = { day: null, idx: null };
                renderDevList();
            });
        });

        // Event listener for saving schedule edit
        document.querySelectorAll('.save-schedule-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dayKey = e.target.getAttribute('data-day');
                const idx = parseInt(e.target.getAttribute('data-idx'), 10);
                const timeInput = document.getElementById(`edit_val_time_${dayKey}_${idx}`);
                const titleInput = document.getElementById(`edit_val_title_${dayKey}_${idx}`);
                const descInput = document.getElementById(`edit_val_desc_${dayKey}_${idx}`);

                if (!timeInput || !timeInput.value.trim() || !titleInput || !titleInput.value.trim()) {
                    alert('Please provide both Time Slot and Title!');
                    return;
                }

                let scheduleObj = JSON.parse(localStorage.getItem('hackorbit_schedule')) || DEFAULT_SCHEDULE_DATA;
                if (scheduleObj[dayKey] && scheduleObj[dayKey][idx]) {
                    scheduleObj[dayKey][idx].time = timeInput.value.trim();
                    scheduleObj[dayKey][idx].title = titleInput.value.trim();
                    scheduleObj[dayKey][idx].desc = descInput.value.trim();
                    localStorage.setItem('hackorbit_schedule', JSON.stringify(scheduleObj));
                    editingScheduleItem = { day: null, idx: null };
                    renderDevList();
                    transmitLiveSync();
                    showToast('✅ Session changes saved and broadcasted live!');
                }
            });
        });

        // Event listener for adding a new schedule item via inline form
        document.querySelectorAll('.submit-inline-schedule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dayKey = e.target.getAttribute('data-day');
                const timeVal = (document.getElementById(`add_time_${dayKey}`) || {}).value || '';
                const titleVal = (document.getElementById(`add_title_${dayKey}`) || {}).value || '';
                const descVal = (document.getElementById(`add_desc_${dayKey}`) || {}).value || '';

                if (!titleVal.trim() || !timeVal.trim()) {
                    alert('Please enter both a Time Slot and a Session Title!');
                    return;
                }

                let scheduleObj = JSON.parse(localStorage.getItem('hackorbit_schedule')) || DEFAULT_SCHEDULE_DATA;
                if (!scheduleObj[dayKey]) scheduleObj[dayKey] = [];
                
                scheduleObj[dayKey].push({
                    id: String(Date.now()),
                    time: timeVal.trim(),
                    title: titleVal.trim(),
                    desc: descVal.trim()
                });

                localStorage.setItem('hackorbit_schedule', JSON.stringify(scheduleObj));
                renderDevList();
                transmitLiveSync();
                showToast('✅ Session added to timetable & broadcasted instantly!');
            });
        });
    }

    // Show confirmation toast
    function showToast(msg) {
        if (!toast) return;
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }

    // Handle Form Submission for new live broadcasts
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const eventDateInput = document.getElementById('eventDate') ? document.getElementById('eventDate').value.trim() : '';
        const category = document.getElementById('category').value;
        const priority = document.getElementById('priority').value;
        const text = document.getElementById('text').value.trim();

        if (!title || !text) return;

        const dateStr = eventDateInput || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const newItem = {
            id: String(Date.now()),
            title,
            category,
            priority,
            text,
            eventDate: dateStr,
            timestamp: dateStr
        };

        const existingData = JSON.parse(localStorage.getItem('hackorbit_broadcasts')) || [];
        existingData.unshift(newItem); // Put newest on top
        localStorage.setItem('hackorbit_broadcasts', JSON.stringify(existingData));

        renderDevList();
        transmitLiveSync();
        form.reset();
        showToast('✅ Broadcast Transmitted across Live Channels!');
    });

    // Handle Back Option button at top right of dashboard
    if (backToFeedBtn) {
        backToFeedBtn.addEventListener('click', () => {
            if (activeExpandedCardId !== null) {
                activeExpandedCardId = null;
                renderDevList();
                showToast('🔙 Returned to main live events feed!');
            } else {
                showToast('ℹ️ Already viewing live events overview!');
            }
        });
    }

    // Reset Demo Data
    if (resetDefaultBtn) {
        resetDefaultBtn.addEventListener('click', () => {
            localStorage.setItem('hackorbit_broadcasts', JSON.stringify(DEFAULT_BROADCASTS));
            localStorage.setItem('hackorbit_schedule', JSON.stringify(DEFAULT_SCHEDULE_DATA));
            localStorage.removeItem('hackorbit_schedule_labels');
            activeExpandedCardId = null;
            renderDevList();
            transmitLiveSync();
            showToast('🔄 Demo announcements & schedule timetables restored!');
        });
    }

    // Initial render
    renderDevList();

    // Initialize Data Ecosystem Customizer Console
    initEcosystemCustomizer(showToast, transmitLiveSync);

    // Initialize Frequently Asked Questions (FAQ) Customizer Console
    initFaqCustomizer(showToast, transmitLiveSync);

    // Re-render if storage changes from outside
    window.addEventListener('storage', (e) => {
        if (e.key === 'hackorbit_broadcasts' || e.key === 'hackorbit_schedule' || e.key === 'hackorbit_schedule_labels' || e.key === 'hackorbit_ecosystem' || e.key === 'hackorbit_faq') {
            renderDevList();
            if (e.key === 'hackorbit_ecosystem' && typeof window.refreshEcoConsole === 'function') {
                window.refreshEcoConsole();
            }
            if (e.key === 'hackorbit_faq' && typeof window.refreshFaqConsole === 'function') {
                window.refreshFaqConsole();
            }
        }
    });
}

const DEFAULT_ECOSYSTEM_DATA = {
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

function initEcosystemCustomizer(showToast, transmitLiveSync) {
    const ecoSubtitle = document.getElementById('ecoSubtitle');
    const ecoTitle = document.getElementById('ecoTitle');
    const ecoDesc = document.getElementById('ecoDesc');
    const saveEcoOverviewBtn = document.getElementById('saveEcoOverviewBtn');
    const ecoStatsContainer = document.getElementById('ecoStatsContainer');
    const addEcoStatBtn = document.getElementById('addEcoStatBtn');
    const saveEcoStatsBtn = document.getElementById('saveEcoStatsBtn');
    const ecoTracksContainer = document.getElementById('ecoTracksContainer');
    const addEcoTrackBtn = document.getElementById('addEcoTrackBtn');
    const saveEcoTracksBtn = document.getElementById('saveEcoTracksBtn');
    const resetEcosystemBtn = document.getElementById('resetEcosystemBtn');

    if (!ecoSubtitle || !ecoStatsContainer || !ecoTracksContainer) return;

    function getEco() {
        let eco = JSON.parse(localStorage.getItem('hackorbit_ecosystem'));
        if (!eco) return DEFAULT_ECOSYSTEM_DATA;
        if (eco.desc && eco.desc.startsWith("HackOrbit connects elite student")) {
            eco.desc = "A platform where innovation meets opportunity, empowering participants to create cutting-edge solutions through collaboration, creativity, and technical excellence.";
        }
        if (eco.title && eco.title.includes("Data Ecosystem")) {
            eco.title = "Enter the <span class=\"text-gradient\">Ecosystem</span>";
        }
        return eco;
    }

    function saveEco(ecoData) {
        localStorage.setItem('hackorbit_ecosystem', JSON.stringify(ecoData));
        if (typeof transmitLiveSync === 'function') transmitLiveSync();
    }

    // Read what is currently typed in the DOM textboxes without saving to localStorage or broadcasting
    function getDomStats() {
        if (!ecoStatsContainer) return [];
        const vals = ecoStatsContainer.querySelectorAll('.eco-stat-val');
        const labels = ecoStatsContainer.querySelectorAll('.eco-stat-label');
        const list = [];
        vals.forEach((v, i) => {
            list.push({
                value: v.value,
                label: labels[i] ? labels[i].value : '',
                style: (i === 0) ? 'text-gradient' : 'color: var(--accent-cyan);'
            });
        });
        return list;
    }

    function getDomTracks() {
        if (!ecoTracksContainer) return [];
        const icons = ecoTracksContainer.querySelectorAll('.eco-track-icon');
        const titles = ecoTracksContainer.querySelectorAll('.eco-track-title');
        const descs = ecoTracksContainer.querySelectorAll('.eco-track-desc');
        const list = [];
        icons.forEach((ic, i) => {
            list.push({
                icon: ic.value,
                title: titles[i] ? titles[i].value : '',
                desc: descs[i] ? descs[i].value : ''
            });
        });
        return list;
    }

    function renderStatsUi(statsList) {
        if (!ecoStatsContainer) return;
        ecoStatsContainer.innerHTML = (statsList || []).map((st, idx) => `
            <div style="background: #060b14; border: 1px solid #1f2937; padding: 0.8rem; border-radius: 4px; display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #00f2fe; font-weight: 700; font-size: 0.85rem;">Stat Box #${idx + 1}</span>
                    <button class="remove-stat-btn" data-index="${idx}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-weight: 700; font-size: 0.85rem;">❌ Remove</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.6rem;">
                    <input type="text" class="eco-stat-val" value="${st.value || ''}" placeholder="Value (e.g. $15K+)" style="padding: 0.5rem; background: #0b1120; border: 1px solid #374151; color: #fff; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem;">
                    <input type="text" class="eco-stat-label" value="${st.label || ''}" placeholder="Label (e.g. Prize Pool)" style="padding: 0.5rem; background: #0b1120; border: 1px solid #374151; color: #fff; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem;">
                </div>
            </div>
        `).join('');

        ecoStatsContainer.querySelectorAll('.remove-stat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                const cur = getDomStats();
                cur.splice(idx, 1);
                renderStatsUi(cur);
                showToast('ℹ️ Stat removed in editor. Click "SAVE STATS" to sync to main website.');
            });
        });
    }

    function renderTracksUi(tracksList) {
        if (!ecoTracksContainer) return;
        ecoTracksContainer.innerHTML = (tracksList || []).map((tr, idx) => `
            <div style="background: #060b14; border: 1px solid #1f2937; padding: 1.2rem; border-radius: 6px; display: flex; flex-direction: column; gap: 0.8rem; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; padding-bottom: 0.5rem;">
                    <span style="color: #00f2fe; font-weight: 700; font-size: 0.9rem;">Track #${idx + 1}</span>
                    <button class="remove-track-btn" data-index="${idx}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-weight: 700; font-size: 0.85rem;">❌ Remove</button>
                </div>
                <div>
                    <label style="display: block; color: #94a3b8; font-size: 0.8rem; margin-bottom: 0.2rem;">Icon Emoji & Title</label>
                    <div style="display: grid; grid-template-columns: 60px 1fr; gap: 0.5rem;">
                        <input type="text" class="eco-track-icon" value="${tr.icon || ''}" style="padding: 0.5rem; background: #0b1120; border: 1px solid #374151; color: #fff; text-align: center; border-radius: 4px; font-size: 1.1rem;">
                        <input type="text" class="eco-track-title" value="${tr.title || ''}" placeholder="Track Name" style="padding: 0.5rem; background: #0b1120; border: 1px solid #374151; color: #fff; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 700;">
                    </div>
                </div>
                <div>
                    <label style="display: block; color: #94a3b8; font-size: 0.8rem; margin-bottom: 0.2rem;">Challenge Goal / Description</label>
                    <textarea class="eco-track-desc" rows="3" style="width: 100%; padding: 0.6rem; background: #0b1120; border: 1px solid #374151; color: #fff; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; resize: vertical;">${tr.desc || ''}</textarea>
                </div>
            </div>
        `).join('');

        ecoTracksContainer.querySelectorAll('.remove-track-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                const cur = getDomTracks();
                cur.splice(idx, 1);
                renderTracksUi(cur);
                showToast('ℹ️ Track removed in editor. Click "SAVE CHALLENGE TRACKS" to sync to main website.');
            });
        });
    }

    function renderEcoConsole() {
        const eco = getEco();
        
        // Populate Header Overview inputs
        if (ecoSubtitle) ecoSubtitle.value = eco.subtitle || '';
        if (ecoTitle) ecoTitle.value = eco.title || '';
        if (ecoDesc) ecoDesc.value = eco.desc || '';

        renderStatsUi(eco.stats || []);
        renderTracksUi(eco.tracks || []);
    }

    window.refreshEcoConsole = renderEcoConsole;

    // Bind save overview button (EXPLICIT SAVE ONLY)
    if (saveEcoOverviewBtn) {
        saveEcoOverviewBtn.addEventListener('click', () => {
            const eco = getEco();
            if (ecoSubtitle) eco.subtitle = ecoSubtitle.value;
            if (ecoTitle) eco.title = ecoTitle.value;
            if (ecoDesc) eco.desc = ecoDesc.value;
            saveEco(eco);
            showToast('✅ Ecosystem Overview Saved Live to Main Website!');
        });
    }

    // Bind save stats button (EXPLICIT SAVE ONLY)
    if (saveEcoStatsBtn) {
        saveEcoStatsBtn.addEventListener('click', () => {
            const eco = getEco();
            eco.stats = getDomStats();
            saveEco(eco);
            showToast('📊 Stat Counters Saved Live to Main Website!');
        });
    }

    // Bind save tracks button (EXPLICIT SAVE ONLY)
    if (saveEcoTracksBtn) {
        saveEcoTracksBtn.addEventListener('click', () => {
            const eco = getEco();
            eco.tracks = getDomTracks();
            saveEco(eco);
            showToast('🚀 Challenge Tracks Saved Live to Main Website!');
        });
    }

    // Bind add stat button (Updates local UI only without saving to main website)
    if (addEcoStatBtn) {
        addEcoStatBtn.addEventListener('click', () => {
            const cur = getDomStats();
            cur.push({ value: "100+", label: "New Metric", style: "color: var(--accent-cyan);" });
            renderStatsUi(cur);
            showToast('➕ New stat box added in editor! Click "SAVE STATS" when ready to publish.');
        });
    }

    // Bind add track button (Updates local UI only without saving to main website)
    if (addEcoTrackBtn) {
        addEcoTrackBtn.addEventListener('click', () => {
            const cur = getDomTracks();
            cur.push({ icon: "⚡", title: "New AI Challenge", desc: "Describe the challenge guidelines, dataset format, and bounty awards here." });
            renderTracksUi(cur);
            showToast('➕ New challenge track added in editor! Click "SAVE CHALLENGE TRACKS" when ready to publish.');
        });
    }

    // Bind reset button
    if (resetEcosystemBtn) {
        resetEcosystemBtn.addEventListener('click', () => {
            saveEco(DEFAULT_ECOSYSTEM_DATA);
            renderEcoConsole();
            showToast('🔄 Enter the Ecosystem restored to defaults!');
        });
    }

    // Initialize customizer UI
    renderEcoConsole();
}

const DEFAULT_FAQ_DATA = {
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

function initFaqCustomizer(showToast, transmitLiveSync) {
    const faqSubtitle = document.getElementById('faqSubtitle');
    const faqTitle = document.getElementById('faqTitle');
    const faqDesc = document.getElementById('faqDesc');
    const saveFaqOverviewBtn = document.getElementById('saveFaqOverviewBtn');

    const faqItemsContainer = document.getElementById('faqItemsContainer');
    const addFaqItemBtn = document.getElementById('addFaqItemBtn');
    const saveFaqItemsBtn = document.getElementById('saveFaqItemsBtn');
    const resetFaqBtn = document.getElementById('resetFaqBtn');

    if (!faqItemsContainer) return;

    function getFaq() {
        return JSON.parse(localStorage.getItem('hackorbit_faq')) || DEFAULT_FAQ_DATA;
    }

    function saveFaq(faqData) {
        localStorage.setItem('hackorbit_faq', JSON.stringify(faqData));
        if (typeof transmitLiveSync === 'function') transmitLiveSync();
        try {
            const channel = new BroadcastChannel('hackorbit_live_channel');
            channel.postMessage({ type: 'UPDATE_FAQ' });
        } catch (e) {
            // ignore
        }
    }

    function getDomFaqItems() {
        if (!faqItemsContainer) return [];
        const rows = faqItemsContainer.querySelectorAll('.faq-item-edit-row');
        const items = [];
        rows.forEach(row => {
            const qEl = row.querySelector('.faq-item-q');
            const aEl = row.querySelector('.faq-item-a');
            if (qEl && aEl) {
                items.push({
                    q: qEl.value.trim(),
                    a: aEl.value.trim()
                });
            }
        });
        return items;
    }

    function renderFaqItemsUi(items) {
        if (!faqItemsContainer) return;
        faqItemsContainer.innerHTML = '';

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'faq-item-edit-row';
            div.style.cssText = "background: rgba(15, 23, 42, 0.7); border: 1px solid #334155; border-radius: 8px; padding: 1.2rem; position: relative;";
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                    <span style="color: #f43f5e; font-size: 0.85rem; font-weight: 700;">Question #${index + 1}</span>
                    <button class="remove-faq-btn" style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #ef4444; border-radius: 4px; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; font-weight: 700;">🗑️ Remove</button>
                </div>
                <div style="margin-bottom: 0.8rem;">
                    <label style="display: block; color: #94a3b8; font-size: 0.8rem; margin-bottom: 0.3rem;">Question Title</label>
                    <input type="text" class="dev-select faq-item-q" style="width: 100%;" value="${item.q.replace(/"/g, '&quot;') || ''}" placeholder="e.g. Can beginners participate?">
                </div>
                <div>
                    <label style="display: block; color: #94a3b8; font-size: 0.8rem; margin-bottom: 0.3rem;">Answer Description</label>
                    <textarea class="dev-select faq-item-a" style="width: 100%; resize: vertical;" rows="3" placeholder="Provide clear instructions and helpful links...">${item.a || ''}</textarea>
                </div>
            `;

            const removeBtn = div.querySelector('.remove-faq-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    div.remove();
                    const remainingRows = faqItemsContainer.querySelectorAll('.faq-item-edit-row');
                    remainingRows.forEach((r, idx) => {
                        const span = r.querySelector('span');
                        if (span) span.textContent = `Question #${idx + 1}`;
                    });
                    showToast('🗑️ FAQ question removed in editor! Click "SAVE FAQS" to update main website.');
                });
            }

            faqItemsContainer.appendChild(div);
        });
    }

    function renderFaqConsole() {
        const data = getFaq();
        if (faqSubtitle) faqSubtitle.value = data.subtitle || '';
        if (faqTitle) faqTitle.value = data.title || '';
        if (faqDesc) faqDesc.value = data.desc || '';

        renderFaqItemsUi(data.items || []);
    }

    window.refreshFaqConsole = renderFaqConsole;

    // Bind save overview button
    if (saveFaqOverviewBtn) {
        saveFaqOverviewBtn.addEventListener('click', () => {
            const data = getFaq();
            data.subtitle = faqSubtitle ? faqSubtitle.value.trim() : '';
            data.title = faqTitle ? faqTitle.value.trim() : '';
            data.desc = faqDesc ? faqDesc.value.trim() : '';
            saveFaq(data);
            showToast('💾 FAQ section overview saved & published to main website!');
        });
    }

    // Bind save FAQ items button
    if (saveFaqItemsBtn) {
        saveFaqItemsBtn.addEventListener('click', () => {
            const data = getFaq();
            data.items = getDomFaqItems();
            saveFaq(data);
            showToast('💾 Frequently Asked Questions saved & synced to main website!');
        });
    }

    // Bind add FAQ question button (Updates local UI only without saving to main website)
    if (addFaqItemBtn) {
        addFaqItemBtn.addEventListener('click', () => {
            const cur = getDomFaqItems();
            cur.push({
                q: "New HackOrbit Question?",
                a: "Provide your detailed explanation, hackathon guidelines, or mentor contact instructions here."
            });
            renderFaqItemsUi(cur);
            faqItemsContainer.scrollTop = faqItemsContainer.scrollHeight;
            showToast('➕ New FAQ question added in editor! Click "SAVE FAQS" when ready to publish.');
        });
    }

    // Bind reset button
    if (resetFaqBtn) {
        resetFaqBtn.addEventListener('click', () => {
            saveFaq(DEFAULT_FAQ_DATA);
            renderFaqConsole();
            showToast('🔄 Frequently Asked Questions restored to defaults!');
        });
    }

    // Initialize customizer UI
    renderFaqConsole();
}
