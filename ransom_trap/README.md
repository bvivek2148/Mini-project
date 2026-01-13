# Ransom-Trap: Dual-Layer Anti-Ransomware System

Entropy-based ransomware detection + honeytoken deception.

- **Layer 1 – Entropy Guard (Active Defense):** watches file changes and computes Shannon entropy to detect ransomware-like encryption behavior.
- **Layer 2 – Decepti-File (Passive Defense):** plants honeytoken files (e.g. `passwords.xlsx`, `bank_logins.txt`) and raises immediate alerts when they are accessed.

This is a proof-of-concept endpoint agent + alert server + ransomware simulator.

---

## 1. Project Structure

```text
ransom_trap/
  agent/
    __init__.py
    agent_main.py          # Entry point for endpoint agent
    config_loader.py       # Load YAML config
    entropy.py             # Shannon entropy calculations
    filesystem_watcher.py  # Watchdog-based file system watcher
    honeytokens.py         # Create and manage honeytoken files
    process_tracker.py     # Track per-process file events
    detector.py            # Apply entropy-based detection rules
    response.py            # Send alerts and optionally kill processes
  server/
    __init__.py
    server_main.py         # FastAPI alert server
    storage.py             # In-memory + JSONL alert storage
  simulator/
    __init__.py
    fake_ransomware.py     # Simple ransomware simulator (XOR scrambling)
  config/
    config.example.windows.yaml
    config.example.linux.yaml
  data/
    alerts.jsonl           # Created at runtime by server
  logs/
    agent.log              # Created at runtime by agent
  requirements.txt
  PROJECT_INFO.txt
  README.md (this file)
```

---

## 2. Features

- **Cross-platform**: works on Windows and Linux (Python 3.10+).
- **Real-time monitoring** of configured directories using `watchdog`.
- **Shannon entropy detection**:
  - Reads the first chunk of each modified file.
  - Computes entropy (0–8 bits/byte).
  - Tracks per-process activity and flags suspicious behavior.
- **Honeytokens (canary files)**:
  - Automatically generated in specified directories.
  - Any access (read/modify) generates an immediate alert.
- **Central alert server**:
  - HTTP API using FastAPI (`/alerts`, `/`).
  - Simple HTML dashboard to view alerts.
  - JSONL file (`data/alerts.jsonl`) for persistence.
- **Ransomware simulator**:
  - Walks a directory and XOR-scrambles file contents.
  - Useful for safe demos on test data.

**Important:** This is **not production security software**. Use only on test data or lab environments.

---

## 3. Requirements

- Python **3.10+** (3.11/3.12 are fine).
- `pip` (Python package manager).
- Recommended: virtual environment (`venv`).

Python dependencies (installed via `requirements.txt`):

- `watchdog`
- `psutil`
- `requests`
- `PyYAML`
- `fastapi`
- `uvicorn`

---

## 4. Setup Instructions (Windows)

These instructions assume PowerShell and that you are inside the `ransom_trap` folder.

### 4.1. Create and activate a virtual environment

```powershell
cd path\to\ransom_trap
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell execution policy blocks activation, you may need to adjust it temporarily:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

### 4.2. Install Python dependencies

```powershell
pip install -r requirements.txt
```

### 4.3. Create and edit configuration

Copy the Windows example config:

```powershell
Copy-Item config\config.example.windows.yaml config\config.yaml
```

Open `config\config.yaml` and edit these sections to use **real paths** on your system:

```yaml
agent:
  monitored_paths:
    - "C:\\Users\\YourUser\\Documents"
    - "C:\\Users\\YourUser\\Desktop"
  honeytoken_paths:
    - "C:\\Users\\YourUser\\Documents"
    - "C:\\Users\\YourUser\\Desktop"
  alert_server_url: "http://127.0.0.1:8000"
  log_file: "logs\\agent.log"

detection:
  entropy_threshold: 7.0
  min_suspicious_files: 3      # Lowered for easier demos
  time_window_seconds: 5       # Lowered for easier demos
  kill_on_detection: false     # Keep false while testing
  ignored_processes:
    - "backup.exe"
    - "chrome.exe"

honeytokens:
  file_names:
    - "passwords.xlsx"
    - "bank_logins.txt"
    - "budget_2024.pdf"
  auto_regenerate: true

host:
  hostname: null               # Auto-detected if null
```

You can also point everything to a dedicated lab folder, e.g.:

```yaml
agent:
  monitored_paths:
    - "D:\\lab\\monitored"
  honeytoken_paths:
    - "D:\\lab\\monitored"
  alert_server_url: "http://127.0.0.1:8000"
  log_file: "logs\\agent.log"
```

Create `D:\lab\monitored` manually or let the agent create it.

---

## 5. Setup Instructions (Linux)

These instructions assume Bash and that you are inside the `ransom_trap` folder.

### 5.1. Create and activate a virtual environment

```bash
cd /path/to/ransom_trap
python3 -m venv venv
source venv/bin/activate
```

### 5.2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 5.3. Create and edit configuration

Copy the Linux example config:

```bash
cp config/config.example.linux.yaml config/config.yaml
```

Edit `config/config.yaml`:

```yaml
agent:
  monitored_paths:
    - "/home/youruser/Documents"
    - "/home/youruser/Desktop"
  honeytoken_paths:
    - "/home/youruser/Documents"
    - "/home/youruser/Desktop"
  alert_server_url: "http://127.0.0.1:8000"
  log_file: "logs/agent.log"

detection:
  entropy_threshold: 7.0
  min_suspicious_files: 3
  time_window_seconds: 5
  kill_on_detection: false
  ignored_processes:
    - "rsync"
    - "tar"

honeytokens:
  file_names:
    - "passwords.xlsx"
    - "bank_logins.txt"
    - "budget_2024.pdf"
  auto_regenerate: true

host:
  hostname: null
```

As on Windows, you can use a dedicated lab directory instead of real user folders.

---

## 6. Running the Alert Server (Windows & Linux)

With the virtual environment activated and from the `ransom_trap` folder, run:

```bash
uvicorn server.server_main:app --host 0.0.0.0 --port 8000
```

- Server will start and listen on port 8000.
- Open your browser at:
  - `http://127.0.0.1:8000/`     – HTML dashboard (table of alerts)
  - `http://127.0.0.1:8000/alerts` – raw JSON alerts

Leave this server running while you run the agent and simulator.

---

## 7. Running the Agent (Windows & Linux)

In a **second terminal**, activate the same virtual environment and run:

### Windows (PowerShell)

```powershell
cd path\to\ransom_trap
.\venv\Scripts\Activate.ps1
python -m agent.agent_main --config config/config.yaml
```

### Linux (Bash)

```bash
cd /path/to/ransom_trap
source venv/bin/activate
python -m agent.agent_main --config config/config.yaml
```

You should see log lines like:

```text
INFO ransom_trap.agent: Starting Ransom-Trap agent with config config/config.yaml
INFO ransom_trap.agent: Honeytokens active at X paths
INFO ransom_trap.agent: Watching path: ...
INFO ransom_trap.agent: Ransom-Trap agent is now monitoring N path(s)
```

The agent will:

- Ensure monitored and honeytoken directories exist.
- Create honeytoken files in each `honeytoken_paths` directory.
- Monitor `monitored_paths` for file create/modify events.

---

## 8. Running the Ransomware Simulator (Demo)

**Use ONLY on test folders. Do not run on important personal or production data.**

### 8.1. Prepare a test directory

1. Pick or create a directory that is included in both `monitored_paths` and `honeytoken_paths`, for example:
   - Windows: `D:\lab\monitored`
   - Linux: `/home/youruser/ransom_lab`

2. Put some **test files** in there: `.txt`, `.docx`, `.pdf`, images, etc.

3. Make sure the agent is running and has logged that it is watching this path.

### 8.2. Run the simulator

With venv activated and from `ransom_trap`:

#### Windows

```powershell
python -m simulator.fake_ransomware "D:\lab\monitored"
```

#### Linux

```bash
python -m simulator.fake_ransomware "/home/youruser/ransom_lab"
```

The simulator will:

- Walk the directory tree.
- Read each file.
- Overwrite it with XOR-scrambled bytes (increasing entropy significantly).

### 8.3. Observe alerts

1. In the **agent** terminal, you should see log lines like:

   - `ALERT: {"alert_type": "honeytoken_access", ...}`
   - `ALERT: {"alert_type": "ransomware_suspected", ...}` (once thresholds are exceeded).

2. In the **server** terminal, you will see `POST /alerts` requests with status `200 OK`.

3. In your **browser**:

   - Visit `http://127.0.0.1:8000/alerts` to see raw JSON.
   - Visit `http://127.0.0.1:8000/` to see the formatted table of alerts.

You should see rows for:

- `honeytoken_access` – when honeytoken files like `passwords.xlsx` or `bank_logins.txt` are touched.
- `ransomware_suspected` – when many high-entropy writes are detected from the same process in a short time window.

---

## 9. Tuning Detection

The `detection` block in `config/config.yaml` controls how sensitive Entropy Guard is:

```yaml
detection:
  entropy_threshold: 7.0
  min_suspicious_files: 3
  time_window_seconds: 5
  kill_on_detection: false
  ignored_processes:
    - "backup.exe"   # Windows examples
    - "chrome.exe"
```

- **entropy_threshold**:
  - 0–8 bits/byte; higher means more random.
  - Normal text/doc files are lower; encrypted/compressed data are close to 8.
  - 7.0 is a reasonable demo default.

- **min_suspicious_files**:
  - Number of high-entropy files a process must modify in the time window.
  - Lower this to trigger detections sooner during demos.

- **time_window_seconds**:
  - Time window for counting suspicious file events.

- **kill_on_detection**:
  - When `true`, the agent attempts to terminate the suspected process using `psutil`.
  - **Keep `false` while testing**; only enable on a dedicated lab environment.

- **ignored_processes**:
  - List of process names to skip (case-insensitive), e.g. backup tools.

---

## 10. Safety Notes & Limitations

- This is a **proof-of-concept**, not production-ready security software.
- `ProcessTracker.resolve_process_for_path` uses a best-effort heuristic based on open file handles; it may not always attribute activity perfectly.
- Real backup, sync, and compression software may also create high-entropy files. Use `ignored_processes` and tuned thresholds to avoid false positives.
- The ransomware simulator **destroys file contents** in its target directory. Always use disposable test data.

---

## 11. Quick Start Summary

1. **Clone/copy** the `ransom_trap` folder.
2. **Create venv + install deps**:
   - `python -m venv venv` and `pip install -r requirements.txt`.
3. **Copy config**:
   - Windows: `Copy-Item config\config.example.windows.yaml config\config.yaml`
   - Linux: `cp config/config.example.linux.yaml config/config.yaml`
4. **Edit `config.yaml`** paths and detection thresholds.
5. **Start server**: `uvicorn server.server_main:app --host 0.0.0.0 --port 8000`.
6. **Start agent**: `python -m agent.agent_main --config config/config.yaml`.
7. **Run simulator** on a test folder in `monitored_paths`.
8. **View alerts** at `http://127.0.0.1:8000/`.

You now have a working demonstration of a dual-layer anti-ransomware system: Entropy Guard + Decepti-File.