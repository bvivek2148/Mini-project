# 🛡️ Ransom-Trap: Intelligent Anti-Ransomware Defense Platform

<div align="center">

**Entropy-Based Detection · Honeytoken Deception · Active Process Termination · OS-Level Folder Locking**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Key Features](#-key-features)
3. [Screenshots](#-screenshots)
4. [System Architecture](#-system-architecture)
5. [Detection Algorithm Deep-Dive](#-detection-algorithm-deep-dive)
6. [Active Response Workflow](#-active-response-workflow)
7. [Project Structure](#-project-structure)
8. [Tech Stack](#-tech-stack)
9. [Prerequisites](#-prerequisites)
10. [Installation & Setup](#-installation--setup)
11. [Running the Application](#-running-the-application)
12. [Dashboard Pages & Frontend Routes](#-dashboard-pages--frontend-routes)
13. [Configuration Reference](#-configuration-reference)
14. [Ransomware Simulation & Testing](#-ransomware-simulation--testing)
15. [Alert Payload Examples](#-alert-payload-examples)
16. [API Reference](#-api-reference)
17. [Troubleshooting](#-troubleshooting)
18. [Safety Notes & Limitations](#-safety-notes--limitations)
19. [Future Enhancements](#-future-enhancements)
20. [Contributing](#-contributing)
21. [License](#-license)

---

## Overview

**Ransom-Trap** is a full-stack Endpoint Detection and Response (EDR) platform designed to detect, block, and mitigate ransomware attacks in real-time. It combines two fundamentally different detection strategies into a unified defense system:

| Layer | Name | Strategy | How It Works |
|-------|------|----------|-------------|
| **Layer 1** | **Entropy Guard** (Active Defense) | Shannon entropy analysis | Monitors file modifications in real-time. When files are rapidly overwritten with high-entropy (encrypted/random) data, the system detects the ransomware pattern and intervenes automatically. |
| **Layer 2** | **Decepti-File** (Passive Defense) | Honeytoken deception | Plants decoy files (`passwords.xlsx`, `bank_logins.txt`, `budget_2024.pdf`) in monitored directories. Any access to these bait files immediately triggers a high-priority alert — because no legitimate user would open a file called `bank_logins.txt`. |

### Why Two Layers?

Most antivirus tools rely on **signature-based detection** — they compare files against a known database of malware. This fails against:
- **Zero-day ransomware** (never seen before)
- **Polymorphic malware** (changes its code each time)
- **Fileless ransomware** (operates entirely in memory)

Ransom-Trap takes a **behavior-based approach**. Instead of asking *"Is this file malware?"*, it asks:
- *"Is this process rapidly producing encrypted-looking output?"* → **Entropy Guard**
- *"Did something just touch a file that should never be touched?"* → **Honeytoken Trap**

### What Happens When a Threat is Detected?

Ransom-Trap doesn't just alert — it **actively responds** with a 4-step mitigation sequence:

```
1. 🌐 EXTRACT   → Query the malicious process for active network connections (C&C IPs)
2. 🔪 TERMINATE  → Kill the ransomware process (SIGTERM / psutil.terminate)
3. 🔒 CONTAIN    → Lock the compromised folder to Read-Only using OS ACLs
4. 📲 NOTIFY     → Dispatch detailed alerts via Telegram, Email, and WhatsApp
```

> **⚠️ Important:** This is a proof-of-concept for academic and lab use. Do not deploy on production systems without thorough testing.

---

## 🔑 Key Features

### 🔍 Real-Time Ransomware Detection
- **Shannon entropy analysis** on the first 64KB of every modified file (0–8 bits/byte scale)
- **Sliding time-window** detection: flags a process only when it modifies multiple high-entropy files within a configurable window (default: 3 files in 5 seconds)
- **Per-process tracking** using `psutil` to map file handles to the exact PID responsible
- **Cross-platform path normalization** using `os.path.normcase()` for reliable matching on Windows

### 🍯 Honeytoken Deception System
- **Auto-generates** decoy files (`passwords.xlsx`, `bank_logins.txt`, `budget_2024.pdf`) in monitored directories
- Any read/modification of honeytokens triggers an **immediate** `honeytoken_access` alert
- Supports **auto-regeneration** — honeytoken content is refreshed on every agent startup
- File names are strategically chosen to be irresistible to data-harvesting malware

### 🔪 Active Process Termination
- Identifies the malicious PID holding file handles using Windows `psutil` process iteration with `os.path.normcase()` + `os.path.abspath()` for robust matching
- **Extracts network connections** from the process (potential Command & Control server IPs) before killing it
- Filters out loopback (`127.x.x.x`), private (`192.168.x.x`, `10.x.x.x`) addresses to isolate true external C&C connections
- Sends `SIGTERM` / `terminate()` to forcefully stop the ransomware process
- Controlled by the `kill_on_detection` toggle (can be enabled/disabled live from the Dashboard)

### 🔒 OS-Level Folder Containment (ACL Locking)
- On **Windows**: Uses `icacls` to deny Write (W), Write Data (WD), Append Data (AD), Write Attributes (WA), and Write Extended Attributes (WEA) to `Everyone`
- On **Linux/macOS**: Uses `chmod -R a-w` to strip write bits recursively
- Instantly blocks the ransomware from encrypting additional files in the same directory
- Reversible via the `unlock_folder()` function or the Undo simulation feature
- The lock targets the **parent directory** of the compromised file, protecting all sibling files

### 📲 Multi-Channel Notifications
Each notification includes a comprehensive security readout:

```
🚨 *CRITICAL RANSOMWARE ALERT* 🚨

• *Host:* VIKKY7082
• *Target File:* `D:\test_files\document.txt`
• *Malicious Process:* `python.exe` (PID: 12345)
• *Suspected C&C IPs:* 203.0.113.50, 198.51.100.7

*Mitigation Actions Taken:*
• Process Terminated: ✅ Yes
• Folder Locked (Read-Only): ✅ Yes
```

Supported channels:
- **Telegram**: Sends formatted alerts via the Telegram Bot API with Markdown styling
- **Email**: SMTP-based email alerts with configurable sender/recipient
- **WhatsApp**: Meta Cloud API integration (requires verified business account)

### 🖥️ React Dashboard (Dark-Mode SOC Interface)
- **14 dedicated pages** for security operations
- Real-time polling (5-second intervals) for live alert updates
- Interactive notification bell with detailed ransomware alert tags (`PROC`, `KILLED`, `LOCKED`)
- Agent Start/Stop/Restart controls from the UI
- Alert acknowledgment workflow (Acknowledge → Escalate → Resolve)
- Multi-host aggregation for distributed agent deployments
- **Threat Detection Velocity** chart showing alert volume over the last 24 hours

### 📂 Dynamic Configuration (Hot-Reload)
- Add/remove monitored directories from the UI without restarting the agent
- The agent polls the server every 10 seconds and hot-swaps its filesystem watchers seamlessly
- Honeytoken directories are **automatically synced** with monitored paths — adding a new monitored folder instantly deploys honeytokens there
- All detection thresholds and notification toggles can be changed live
- Kill-on-detection can be toggled from the Settings page without touching `config.yaml`

### 🧪 Safe Ransomware Simulation
- Built-in simulation script that generates high-entropy random data (`os.urandom`) to mimic ransomware encryption
- Creates `.bak` backups before overwriting, enabling full restoration
- **Undo button** in the Dashboard to restore all files to their original state and clean up dummy files
- Dynamically targets whichever directory you are currently monitoring (no hardcoded paths)
- Generates 5 standard dummy documents to ensure the detection threshold is met

### 📊 On-Demand File Scanner (Drag & Drop)
- Drag-and-drop files directly in the browser for instant entropy analysis
- Server-side computation using the same Shannon entropy algorithm as the live agent
- Visual results table highlighting files that breach the entropy threshold as "Compromised" in red
- Useful for forensic analysis of suspicious files without enabling live monitoring

---

## 📸 Screenshots

### Dashboard Overview
The main command center showing active threats, honeytoken hits, total alerts, agent status, threat detection velocity chart, and live threat feed:

![Dashboard Overview](docs/screenshots/dashboard_overview.png)

### Real-Time Alerts
Live-updating alert table with severity icons, host filtering, and detailed event information:

![Alerts Page](docs/screenshots/alerts_page.png)

### Manual Scan & Simulation
Drag-and-drop file scanner with ransomware simulation controls, dynamic directory management, and the Undo restoration feature:

![Manual Scan Page](docs/screenshots/manual_scan_page.png)

---

## 🏗️ System Architecture

The following diagram shows the complete data flow from file modification detection to alert dispatch:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          USER'S MACHINE                                  │
│                                                                          │
│  ┌─────────────────┐    File Events      ┌───────────────────────────┐   │
│  │   Monitored      │ ──────────────────► │    Ransom-Trap Agent      │   │
│  │   Directories    │   (watchdog lib)    │    (Python Process)       │   │
│  │                  │                     │                           │   │
│  │  + Honeytokens   │                     │  ┌─────────────────────┐  │   │
│  │    (bait files)  │                     │  │  filesystem_watcher │  │   │
│  └─────────────────┘                     │  │  (on_created,       │  │   │
│                                           │  │   on_modified)      │  │   │
│                                           │  └─────────┬───────────┘  │   │
│                                           │            │              │   │
│                                           │            ▼              │   │
│                                           │  ┌─────────────────────┐  │   │
│                                           │  │    honeytokens.py   │  │   │
│                                           │  │  "Is this a bait    │  │   │
│                                           │  │   file?"            │  │   │
│                                           │  └──┬──────────┬──────┘  │   │
│                                           │   Yes│          │No      │   │
│                                           │     ▼          ▼        │   │
│                                           │  honeytoken  ┌────────┐  │   │
│                                           │  _access     │entropy │  │   │
│                                           │  alert       │.py     │  │   │
│                                           │              │compute │  │   │
│                                           │              │Shannon │  │   │
│                                           │              └───┬────┘  │   │
│                                           │                  │       │   │
│                                           │                  ▼       │   │
│                                           │  ┌─────────────────────┐ │   │
│                                           │  │  process_tracker.py │ │   │
│                                           │  │  • Resolve PID      │ │   │
│                                           │  │  • Register event   │ │   │
│                                           │  │  • Evaluate window  │ │   │
│                                           │  └─────────┬───────────┘ │   │
│                                           │            │             │   │
│                                           │   Threshold exceeded?    │   │
│                                           │     Yes │                │   │
│                                           │         ▼                │   │
│                                           │  ┌─────────────────────┐ │   │
│                                           │  │   response.py       │ │   │
│                                           │  │  1. Extract C&C IPs │ │   │
│                                           │  │  2. Kill process    │ │   │
│                                           │  │  3. Lock folder     │ │   │
│                                           │  │  4. POST /alerts    │ │   │
│                                           │  └─────────────────────┘ │   │
│                                           └───────────┬──────────────┘   │
│                                                       │                  │
│                                                POST /alerts              │
│                                                       │                  │
│                                           ┌───────────▼──────────────┐   │
│                                           │   FastAPI Server          │   │
│                                           │   (server_main.py)        │   │
│                                           │                           │   │
│                                           │   • Store alert (JSONL)   │   │
│                                           │   • Dispatch notifications│   │
│                                           │     (background thread)   │   │
│                                           │   • Serve config API      │   │
│                                           └───────────┬──────────────┘   │
│                                                       │                  │
│  ┌────────────────────────────────────────────────────▼───────────────┐  │
│  │                React Dashboard (Vite + React 19)                    │  │
│  │                                                                     │  │
│  │   Overview · Alerts · Incidents · Honeytokens · Scanner · Settings  │  │
│  │   Process Logs · Network View · Entropy Analysis · Reports          │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────┐                                │
│  │     External Notification Channels    │                                │
│  │     📧 Email (SMTP/TLS)               │                                │
│  │     📱 Telegram (Bot API + Markdown)   │                                │
│  │     💬 WhatsApp (Meta Graph API)       │                                │
│  └──────────────────────────────────────┘                                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🧮 Detection Algorithm Deep-Dive

### Shannon Entropy Calculation

The core detection mechanism uses **Shannon entropy** — a measure of randomness in data. The formula:

```
H(X) = -Σ p(xᵢ) × log₂(p(xᵢ))
```

Where `p(xᵢ)` is the probability of byte value `xᵢ` appearing in the file.

| Entropy Score | Data Type | Example |
|:---:|-----------|---------|
| 0.0 | Completely uniform | A file containing only the letter "A" |
| 1.0–3.0 | Low randomness | Simple text files, CSV data |
| 3.0–5.0 | Medium randomness | Source code, structured documents |
| 5.0–6.5 | Moderate randomness | Compressed images (JPEG), office docs |
| 6.5–7.5 | High randomness | Compressed archives (ZIP, 7z) |
| **7.5–8.0** | **Very high randomness** | **Encrypted data, ransomware output** |

**Why this works:** Ransomware encrypts files using algorithms like AES-256, which produce output that is statistically indistinguishable from pure random data. This pushes the Shannon entropy to near-maximum (≈ 7.99 bits/byte). Normal files almost never reach this level.

### Implementation Details

```python
# From agent/entropy.py — simplified view
def compute_shannon_entropy(path, max_bytes=65536):
    data = read_first_N_bytes(path, max_bytes)
    
    # Count byte frequencies (256 possible byte values)
    counts = [0] * 256
    for byte in data:
        counts[byte] += 1
    
    # Calculate Shannon entropy
    entropy = 0.0
    for count in counts:
        if count == 0:
            continue
        probability = count / len(data)
        entropy -= probability * log2(probability)
    
    return entropy  # Returns value between 0.0 and 8.0
```

**Performance optimization:** Only the first 64KB of each file is analyzed. This is sufficient for detection (ransomware encrypts from the beginning) while keeping CPU usage minimal.

### Multi-Event Correlation

A single high-entropy file doesn't trigger an alert. The system uses a **sliding time window** to correlate multiple events from the same process:

```
Timeline:                    ┃ 5-second window ┃
                             ┃                 ┃
File 1 modified (7.92) ──────┫─────────────────┃───── Registered
File 2 modified (7.89) ──────┫────────────     ┃───── Registered  
File 3 modified (7.95) ──────┫───────          ┃───── THRESHOLD MET → ALERT!
                             ┃                 ┃
                             ┗━━━━━━━━━━━━━━━━━┛
```

This multi-event correlation eliminates false positives from legitimate high-entropy files (like ZIP archives or encrypted backups).

---

## ⚡ Active Response Workflow

When a `ransomware_suspected` alert is triggered, the system executes the following sequence **automatically** (if `kill_on_detection` is enabled):

```
┌──────────────────────────────────────────────────────────────┐
│                    THREAT DETECTED                            │
│            (3+ high-entropy files in 5 seconds)              │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: NETWORK INTELLIGENCE EXTRACTION                     │
│                                                              │
│  • Query psutil.Process(pid).connections(kind='inet')        │
│  • Filter for ESTABLISHED connections to external IPs        │
│  • Exclude: 127.x.x.x, 192.168.x.x, 10.x.x.x              │
│  • Result: List of suspected C&C server IPs                  │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: PROCESS TERMINATION                                 │
│                                                              │
│  • psutil.Process(pid).terminate()                           │
│  • Handles: NoSuchProcess, AccessDenied gracefully           │
│  • Logs: PID, process name, kill success/failure             │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: FOLDER CONTAINMENT (ACL LOCKING)                    │
│                                                              │
│  Windows:                                                    │
│    icacls <folder> /deny Everyone:(W,WD,AD,WA,WEA)           │
│                                                              │
│  Linux/macOS:                                                │
│    chmod -R a-w <folder>                                     │
│                                                              │
│  • Locks the PARENT directory of the compromised file        │
│  • Ransomware can no longer write to that folder             │
│  • Legitimate users can still READ files                     │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: ALERT DISPATCH                                      │
│                                                              │
│  • POST enriched JSON payload to /alerts                     │
│  • Server stores alert in alerts.jsonl                       │
│  • Background thread dispatches to:                          │
│    📧 Email (SMTP/TLS)                                       │
│    📱 Telegram (Bot API)                                      │
│    💬 WhatsApp (Meta Graph API)                               │
│  • Dashboard notification bell updates in real-time          │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
Mini project/
├── ransom_trap/                    # Backend (Python)
│   ├── agent/                     # Endpoint detection agent
│   │   ├── __init__.py
│   │   ├── agent_main.py          # Agent entry point + config hot-reload loop
│   │   ├── config_loader.py       # YAML config parser + cross-platform hostname resolver
│   │   ├── entropy.py             # Shannon entropy computation (64KB sampling)
│   │   ├── filesystem_watcher.py  # Watchdog-based real-time file monitoring
│   │   ├── honeytokens.py         # Honeytoken manager (create/track/match bait files)
│   │   ├── process_tracker.py     # PID resolution + per-process sliding window tracker
│   │   ├── detector.py            # Entropy-based ransomware detection orchestrator
│   │   ├── response.py            # Alert dispatch + process kill + C&C IP extraction
│   │   └── containment.py         # OS-level ACL folder locking (icacls/chmod)
│   │
│   ├── server/                    # FastAPI alert server
│   │   ├── __init__.py
│   │   ├── server_main.py         # 14 REST endpoints (alerts, config, agent, scan, simulate)
│   │   ├── storage.py             # Thread-safe in-memory + JSONL persistence layer
│   │   └── notifications.py       # Multi-channel dispatcher (Email/Telegram/WhatsApp)
│   │
│   ├── config/
│   │   ├── config.yaml            # Active configuration (live-editable from Dashboard)
│   │   ├── config.example.windows.yaml
│   │   └── config.example.linux.yaml
│   │
│   ├── data/
│   │   └── alerts.jsonl           # Persistent alert log (auto-created at runtime)
│   │
│   ├── logs/
│   │   └── agent.log              # Agent runtime logs (auto-created at runtime)
│   │
│   ├── docs/
│   │   └── screenshots/           # Dashboard screenshots for documentation
│   │
│   ├── requirements.txt           # Python dependencies
│   └── README.md                  # ← You are here
│
├── dashboard/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── api.js                 # 11 API helper functions (fetch, patch, simulate, undo)
│   │   ├── App.jsx                # React Router v6 + sidebar layout
│   │   ├── index.css              # Tailwind CSS configuration
│   │   ├── hooks/
│   │   │   └── useAlerts.js       # Custom React hook for polling alerts every N ms
│   │   └── pages/                 # 14 page components
│   │       ├── DashboardOverviewPage.jsx      # 836 lines — stats, charts, notifications, agent control
│   │       ├── RealTimeAlertsPage.jsx         # Live alert table with host filter + severity icons
│   │       ├── IncidentsPage.jsx              # Incident lifecycle (Acknowledge → Escalate → Resolve)
│   │       ├── ManualScanPage.jsx             # Drag & drop scanner + simulation + directory management
│   │       ├── ThresholdConfigurationPage.jsx # Live toggles + entropy presets + notification switches
│   │       ├── HoneytokenManagementPage.jsx   # Honeytoken deployment grid with status indicators
│   │       ├── HoneytokenAccessLogsPage.jsx   # Honeytoken interaction audit trail
│   │       ├── ProcessTerminationLogPage.jsx  # History of all terminated processes
│   │       ├── EntropyAnalysisPage.jsx        # Entropy distribution charts and file analysis
│   │       ├── NetworkTopologyViewPage.jsx    # Network connection visualization
│   │       ├── ReportsPage.jsx                # Security report generation
│   │       ├── AnalystsPage.jsx               # SOC team management
│   │       ├── LoginPage.jsx                  # Authentication UI
│   │       └── Placeholders.jsx               # Shared skeleton components
│   ├── vite.config.js             # Vite config with /api → localhost:8000 proxy
│   └── package.json
│
└── test_files/                    # Safe testing environment
    ├── simulate_ransomware.py     # Ransomware simulation + undo restoration script
    ├── Desktop/                   # Test subdirectory
    ├── Documents/                 # Test subdirectory with sample files
    └── (dummy files)              # Auto-generated during simulation
```

---

## 🧰 Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Agent Runtime** | Python | 3.10+ | Core detection engine |
| **File Monitoring** | `watchdog` | Latest | Real-time filesystem event detection |
| **Process Analysis** | `psutil` | Latest | PID resolution, network extraction, process termination |
| **Entropy Math** | `math.log2` (stdlib) | — | Shannon entropy computation |
| **HTTP Client** | `requests` | Latest | Agent → Server communication |
| **Config Parser** | `PyYAML` | Latest | YAML configuration file handling |
| **API Server** | FastAPI | 0.100+ | REST API with automatic OpenAPI docs |
| **ASGI Server** | Uvicorn | Latest | High-performance async HTTP server |
| **Data Model** | Pydantic | v2 | Request/response validation |
| **Frontend** | React | 19.x | Component-based SOC dashboard UI |
| **Build Tool** | Vite | 6.x | Lightning-fast dev server + HMR |
| **Styling** | Tailwind CSS | 4.x | Utility-first dark-mode styling |
| **Routing** | React Router | v6 | Client-side page navigation |
| **Notifications** | `smtplib`, `requests` | — | Email (SMTP), Telegram (Bot API), WhatsApp (Meta API) |
| **Persistence** | JSONL (JSON Lines) | — | Flat-file append-only alert storage |
| **OS Integration** | `icacls` / `chmod` | — | Windows ACL / POSIX permission management |

---

## 📋 Prerequisites

| Requirement | Minimum Version | How to Check |
|-------------|----------------|--------------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| pip | Latest | `pip --version` |
| OS | Windows 10/11 or Linux | — |

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/bvivek2148/Mini-project.git
cd Mini-project
```

### Step 2: Setup the Python Backend

```powershell
# Navigate to the backend
cd ransom_trap

# Create a virtual environment
python -m venv venv

# Activate it (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# If execution policy blocks it:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# .\venv\Scripts\Activate.ps1

# Or on Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Dependencies installed:**
- `watchdog` — Filesystem event detection
- `psutil` — Process and system information
- `requests` — HTTP client for API calls
- `PyYAML` — YAML config file parsing
- `fastapi` — REST API framework
- `uvicorn` — ASGI server
- `python-multipart` — File upload support for drag-and-drop scanner

### Step 3: Setup the React Dashboard

```powershell
# Navigate to the dashboard
cd ..\dashboard

# Install Node dependencies
npm install
```

### Step 4: Configure the System

Edit `ransom_trap/config/config.yaml` with your specific paths and preferences:

```yaml
# ═══════════════════════════════════════════════════════════════
# AGENT CONFIGURATION
# ═══════════════════════════════════════════════════════════════
agent:
  alert_server_url: http://127.0.0.1:8000    # FastAPI server URL
  monitored_paths:                            # Directories to watch for ransomware
    - "C:\\Users\\YourUser\\Documents"
  honeytoken_paths:                           # Where to place bait files (auto-synced)
    - "C:\\Users\\YourUser\\Documents"
  log_file: logs\agent.log                    # Agent log file location

# ═══════════════════════════════════════════════════════════════
# DETECTION THRESHOLDS
# ═══════════════════════════════════════════════════════════════
detection:
  entropy_threshold: 7.0          # Shannon entropy cutoff (0-8 scale)
  min_suspicious_files: 3         # Files needed within time window to alert
  time_window_seconds: 5          # Sliding window duration (seconds)
  kill_on_detection: false        # ⚠️ Set true only in lab environments
  ignored_processes:              # Skip these processes (case-insensitive)
    - backup.exe
    - chrome.exe
    - 7z.exe

# ═══════════════════════════════════════════════════════════════
# HONEYTOKEN FILES
# ═══════════════════════════════════════════════════════════════
honeytokens:
  file_names:                     # Names of bait files to deploy
    - passwords.xlsx
    - bank_logins.txt
    - budget_2024.pdf
  auto_regenerate: true           # Refresh content on each agent startup

# ═══════════════════════════════════════════════════════════════
# HOST IDENTIFICATION
# ═══════════════════════════════════════════════════════════════
host:
  hostname: null                  # null = auto-detect from OS

# ═══════════════════════════════════════════════════════════════
# NOTIFICATION CHANNELS
# ═══════════════════════════════════════════════════════════════
notifications:
  email:
    enabled: false
    smtp_host: smtp.gmail.com
    smtp_port: 587
    smtp_user: your@gmail.com
    smtp_password: your_app_password    # Gmail: use App Passwords
    recipients:
      - analyst@example.com

  telegram:
    enabled: false
    bot_token: YOUR_BOT_TOKEN           # Get from @BotFather
    chat_id: YOUR_CHAT_ID              # Get from @userinfobot

  whatsapp:
    enabled: false
    api_token: YOUR_META_GRAPH_API_TOKEN
    phone_number_id: YOUR_SENDER_PHONE_ID
    target_number: YOUR_TARGET_PHONE
```

---

## ▶️ Running the Application

You need **three terminals** running simultaneously:

### Terminal 1: FastAPI Alert Server

```powershell
cd ransom_trap
.\venv\Scripts\python.exe -m uvicorn server.server_main:app --port 8000
```

The server starts at `http://127.0.0.1:8000`. You can verify it's running by visiting the URL in your browser — it will redirect to the dashboard.

### Terminal 2: React Dashboard (Development Mode)

```powershell
cd dashboard
npm run dev
```

The dashboard opens at `http://localhost:5173/`. The Vite dev server automatically proxies all `/api/*` requests to the FastAPI server at port 8000.

### Terminal 3: Detection Agent

```powershell
cd ransom_trap
.\venv\Scripts\python.exe -m agent.agent_main --config config/config.yaml
```

> **💡 Tip:** You can skip Terminal 3 entirely! The Dashboard has a **Start Agent** toggle button on the Overview page that launches the agent as a managed subprocess.

### Expected Startup Output

```
# Terminal 1 (Server):
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.

# Terminal 2 (Dashboard):
VITE v6.x.x ready in 500 ms
➜ Local: http://localhost:5173/

# Terminal 3 (Agent):
INFO ransom_trap.agent: Starting Ransom-Trap agent with config config/config.yaml
INFO ransom_trap.agent: Honeytokens active at 3 paths
INFO ransom_trap.agent: Watching path: D:\...\test_files
INFO ransom_trap.agent: Ransom-Trap agent is now monitoring 1 path(s)
```

---

## 📊 Dashboard Pages & Frontend Routes

All frontend routes are defined in `dashboard/src/App.jsx`. The Vite dev server proxies `/api/*` requests to the FastAPI backend automatically.

| # | Page | Route | Component | Purpose |
|---|------|-------|-----------|---------|
| 1 | **Root Redirect** | `/` | → `/` | Auto-redirects to the Dashboard Overview |
| 2 | **Login** | `/login` | `LoginPage` | Authentication page for SOC analyst access |
| 3 | **Dashboard Overview** | `/` | `DashboardOverviewPage` | Real-time stats (Active Threats, Honeytoken Hits, Total Alerts, Agent Status), Threat Detection Velocity chart (24h), Live Threat Feed, notification bell with severity-coded alert cards, multi-host breakdown, agent Start/Stop toggle |
| 4 | **Manual Scan** | `/scan` | `ManualScanPage` | Drag-and-drop entropy file scanner, ransomware **Simulation Lab** (launch + undo), dynamic monitored directory management (add/remove paths live) |
| 5 | **Incidents** | `/Incidents` | `IncidentsPage` | Full incident lifecycle management — **Acknowledge**, **Escalate**, **Resolve** — with status badges, analyst assignment, and detailed alert timeline |
| 6 | **All Alerts** | `/alerts` | `RealTimeAlertsPage` | Live-updating alert table with severity icons, host filtering, timestamp tracking, and direct incident links |
| 9 | **Alert Detail** | `/alerts/:id` | `IncidentsPage` | View a specific alert by its index — displays full enrichment data (entropy, PID, C&C IPs, containment status) |
| 10 | **Entropy Analysis** | `/entropy` | `EntropyAnalysisPage` | Entropy distribution charts showing file entropy scores across all monitored directories |
| 11 | **Honeytoken Access Logs** | `/accesslogs` | `HoneytokenAccessLogsPage` | Detailed audit trail of every honeytoken file interaction (who accessed, when, from which process) |
| 12 | **Honeytoken Management** | `/honeytokens` | `HoneytokenManagementPage` | Visual grid of all deployed honeytokens with monitoring/triggered status indicators |
| 13 | **User Management** | `/users` | `UserManagementPage` | SOC team user account management |
| 14 | **Analysts** | `/Incidents/analysts` | `AnalystsPage` | SOC analyst roster and task assignment dashboard |
| 15 | **System Settings** | `/settings` | `ThresholdConfigurationPage` | Live toggles for Auto-Kill, Email, Telegram, WhatsApp notifications + entropy sensitivity presets (Conservative / Balanced / Aggressive) |
| 16 | **Reports** | `/reports` | `ReportsPage` | Generate, filter, and export security reports by date range and alert type |
| 17 | **Process Termination Log** | `/Incidents/terminationlog` | `ProcessTerminationLogPage` | History table of all processes terminated by the Active Defense system |
| 18 | **Network Topology** | `/network` | `NetworkTopologyViewPage` | Visualization of network connections extracted from suspected ransomware processes |

---

## ⚙️ Configuration Reference

### Detection Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `entropy_threshold` | `7.0` | 0.0–8.0 | Shannon entropy score above which a file is flagged. Normal text ≈ 4-5, encrypted ≈ 7.9-8.0. Lower = more sensitive, higher = fewer false positives |
| `min_suspicious_files` | `3` | 1–∞ | Minimum high-entropy file modifications from one process within the time window required to trigger an alert |
| `time_window_seconds` | `5` | 1–∞ | Duration of the sliding time window for correlating file events per process |
| `kill_on_detection` | `false` | true/false | If `true`, the agent forcefully terminates the suspected ransomware process immediately |
| `ignored_processes` | `[]` | String list | Process names (case-insensitive) excluded from detection. Use for backup tools, compression utilities, etc. |

### Recommended Presets

| Preset | Entropy | Min Files | Window | Use Case |
|--------|---------|-----------|--------|----------|
| **Conservative** | 7.5 | 5 | 10s | Production systems — low false positives |
| **Balanced** | 7.0 | 3 | 5s | General use — recommended default |
| **Aggressive** | 6.5 | 2 | 3s | High-security labs — maximum detection |

### Notification Channel Setup

| Channel | Required Fields | Setup Instructions |
|---------|----------------|-------------------|
| **Email** | `smtp_host`, `smtp_port`, `smtp_user`, `smtp_password`, `recipients` | For Gmail: enable 2FA → generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) |
| **Telegram** | `bot_token`, `chat_id` | 1. Message [@BotFather](https://t.me/BotFather) → `/newbot` → copy token. 2. Message [@userinfobot](https://t.me/userinfobot) → copy chat_id |
| **WhatsApp** | `api_token`, `phone_number_id`, `target_number` | Requires [Meta Business Developer](https://developers.facebook.com) account with WhatsApp Cloud API access |

---

## 🧪 Ransomware Simulation & Testing

### From the Dashboard (Recommended)

1. Open Dashboard → **Manual Scan** page (`/scan`)
2. Verify the **"Currently Monitoring"** section shows your target directory
3. Click **▶ Generate Test Ransomware (Safe)** — the button dynamically targets your monitoring directory
4. Watch the **notification bell** 🔔 for real-time alerts with detailed tags:
   - `PROC: python.exe` — the process that was detected
   - `KILLED` — confirms the process was terminated
   - `LOCKED` — confirms the folder was locked to Read-Only
5. Check the **Real-Time Alerts** page for comprehensive alert entries
6. Click **↩ Undo Simulation** to restore all files to their original state

### From the Command Line

```powershell
# Navigate to test_files
cd test_files

# Run simulation targeting a specific directory
..\ransom_trap\venv\Scripts\python.exe simulate_ransomware.py "D:\your\test\folder"

# Undo the simulation targeting the same directory
..\ransom_trap\venv\Scripts\python.exe simulate_ransomware.py --undo "D:\your\test\folder"

# Run simulation on the default test_files directory
..\ransom_trap\venv\Scripts\python.exe simulate_ransomware.py
```

### What the Simulator Does (Step by Step)

```
Step 1: Creates 5 dummy text files (standard_dummy_doc_0.txt to _4.txt)
        → Ensures the min_suspicious_files threshold is met
        
Step 2: Scans the target directory for all non-.py files
        → Builds a shuffled list of files to "encrypt"
        
Step 3: For each file:
        a) Creates a .bak backup (shutil.copy2)
        b) Overwrites with 5MB of os.urandom() data (entropy ≈ 8.0)
        c) Holds the file handle open for 1.5 seconds
           → This gives the agent's process_tracker time to catch the PID
           
Step 4: Agent detects 3+ high-entropy writes in 5 seconds
        → Triggers ransomware_suspected alert
        → Kills the simulator process (if kill_on_detection is true)
        → Locks the folder (permission denied error stops further encryption)
```

### What the Undo Does

```
Step 1: Walks the target directory for all .bak files
Step 2: For each .bak file:
        - If it's a dummy file (standard_dummy_doc_*) → DELETE both .bak and original
        - If it's a real file → RESTORE .bak → original, then DELETE .bak
Step 3: Sweeps for any remaining dummy files and deletes them
Step 4: Resets folder permissions (chmod 777 / icacls reset)
```

---

## 📨 Alert Payload Examples

### Ransomware Suspected Alert

This is the full JSON payload stored in `alerts.jsonl` and sent to the Dashboard:

```json
{
  "alert_type": "ransomware_suspected",
  "host": "VIKKY7082",
  "pid": 12548,
  "process_name": "python.exe",
  "timestamp": 1709827200.456,
  "details": {
    "entropy_threshold": 7.0,
    "time_window_seconds": 5,
    "min_suspicious_files": 3
  },
  "remote_ips": ["203.0.113.50"],
  "process_killed": true,
  "folder_locked": true
}
```

### Honeytoken Access Alert

```json
{
  "alert_type": "honeytoken_access",
  "host": "VIKKY7082",
  "pid": 8932,
  "process_name": "explorer.exe",
  "timestamp": 1709827195.123,
  "path": "D:\\test_files\\passwords.xlsx"
}
```

---

## 📡 API Reference

All API endpoints are served at `http://127.0.0.1:8000`. The Vite dev server proxies `/api/*` to this address automatically.

### Alerts API

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|-------------|----------|-------------|
| `GET` | `/alerts` | — | `[{alert}, ...]` | List all stored alerts |
| `POST` | `/alerts` | Alert JSON object | `{"status": "ok"}` | Create a new alert (used by agent) |
| `DELETE` | `/alerts` | — | `{"status": "cleared"}` | Clear all stored alerts |
| `PATCH` | `/alerts/{index}` | `{"status": "acknowledged"}` | `{"status": "ok"}` | Update alert status |

### Agent Control API

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|-------------|----------|-------------|
| `GET` | `/agent/status` | — | `{"running": true, "pid": 1234}` | Check if agent is running |
| `POST` | `/agent/start` | — | `{"status": "started", "pid": 1234}` | Start agent subprocess |
| `POST` | `/agent/stop` | — | `{"status": "stopped", "pid": 1234}` | Stop agent subprocess |

### Simulation API

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|-------------|----------|-------------|
| `POST` | `/agent/simulate` | `{"target_dir": "path"}` (optional) | `{"status": "started"}` | Trigger ransomware simulation |
| `POST` | `/agent/simulate/undo` | `{"target_dir": "path"}` (optional) | `{"status": "started"}` | Undo/restore simulation |

### Configuration API

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|-------------|----------|-------------|
| `GET` | `/config` | — | Config JSON | Get detection/notification settings |
| `PATCH` | `/config` | Partial config JSON | `{"status": "ok"}` | Live-update settings (auto-saves to YAML) |

### Utility API

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|-------------|----------|-------------|
| `GET` | `/honeytokens` | — | `[{name, path, status}, ...]` | List deployed honeytokens |
| `POST` | `/scan` | Multipart file upload | `{"results": [...]}` | On-demand entropy scanning |

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|---------|
| `[Errno 10048] address already in use` | Another process is using port 8000 | Run `Stop-Process -Name python -Force` then restart the server |
| Dashboard shows "No alerts yet" | Agent is not running or not connected | Check Terminal 3 for agent logs, or click Start Agent on the Dashboard |
| `os.uname()` AttributeError | Outdated `config_loader.py` on Windows | Already fixed — uses `platform.node()` instead |
| Simulation doesn't trigger alerts | Agent not watching the simulation directory | Verify `monitored_paths` in config matches the simulation target |
| Undo leaves dummy files behind | Outdated `simulate_ransomware.py` | Already fixed — the cleanup sweep now deletes `standard_dummy_doc_*` files |
| Notification bell shows no details | Alert missing `process_name` field | Fixed via `os.path.normcase()` in `process_tracker.py` |
| `icacls` permission denied | Not running as Administrator | Run PowerShell as Administrator for folder locking to work |
| Telegram messages not sending | Invalid bot token or chat ID | Verify token with `curl https://api.telegram.org/bot<TOKEN>/getMe` |
| Agent keeps restarting watchers | Config polling detects false changes | Normal behavior if paths are being edited from the Dashboard |

---

## ⚠️ Safety Notes & Limitations

> **🔴 CRITICAL WARNINGS:**
> - This is a **proof-of-concept** for academic/research purposes only
> - The ransomware simulator **permanently destroys file contents** — always use on expendable test data
> - `kill_on_detection: true` will forcefully terminate **any** process that triggers the entropy threshold, including legitimate tools
> - The `icacls` folder lock requires **Administrator** privileges on Windows
> - **Never** run the simulator on production data, personal files, or system directories

> **🟡 KNOWN LIMITATIONS:**
> - Process-to-file attribution uses a best-effort heuristic based on `psutil.open_files()` — may not always identify the correct PID
> - The sliding time window groups events by PID; if PID is unresolved, events go to a synthetic PID=-1 bucket
> - JSONL persistence re-writes the entire file on `PATCH /alerts/{index}` — not suitable for high-volume production use
> - Email notifications are currently stubbed (commented-out SMTP calls) — uncomment in `notifications.py` for real delivery
> - The Dashboard does not persist sessions — refreshing the page resets the sidebar state

---

## 🔮 Future Enhancements

- [ ] **Machine Learning Model**: Train a classifier on file entropy distributions to reduce false positives
- [ ] **YARA Rule Integration**: Combine entropy analysis with signature-based YARA rules for hybrid detection
- [ ] **Database Backend**: Replace JSONL with SQLite or PostgreSQL for better query performance
- [ ] **Role-Based Access Control**: Implement JWT authentication with analyst role permissions
- [ ] **Automated Forensic Reports**: Generate PDF incident reports with timeline visualizations
- [ ] **Agent Clustering**: Support multiple agents reporting to a central server with agent health monitoring
- [ ] **File Recovery Vault**: Automatically backup files before they are encrypted (shadow copy integration)
- [ ] **Webhook Integration**: Support for Slack, Discord, and PagerDuty notifications
- [ ] **Docker Deployment**: Containerize the entire stack for one-command deployment

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for cybersecurity research and education**

*Ransom-Trap — Because the best defense is a good trap.*

</div>