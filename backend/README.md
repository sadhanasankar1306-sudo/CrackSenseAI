# CrackSense AI — Backend Setup & Windows 11 PowerShell Guide

Research-grade AI structural health monitoring and finite element assessment backend.

---

## 1. System Requirements & Prerequisites
- **Operating System:** Windows 11 (or Windows 10 build 19041+)
- **Python:** Python 3.10 or 3.11 (64-bit recommended)
- **PowerShell:** Windows PowerShell 5.1 or PowerShell Core 7.x
- **Optional GPU:** NVIDIA GPU with CUDA 11.8+ for accelerated PyTorch U-Net training

---

## 2. Windows 11 PowerShell Quickstart Commands

Open **PowerShell as Administrator** or standard user in the project root:

```powershell
# Navigate to backend directory
cd backend

# Create isolated Python virtual environment
python -m venv venv

# Activate virtual environment in PowerShell
.\venv\Scripts\Activate.ps1

# If script execution is restricted on Windows, allow execution for current session:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Upgrade pip and install wheel
python -m pip install --upgrade pip setuptools wheel

# Install PyTorch (with CUDA support for NVIDIA GPU, or CPU-only)
# For CPU:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install remaining research dependencies
pip install -r requirements.txt
```

---

## 3. Running Automated Tests

Run the deterministic test suite:

```powershell
# Execute unit tests
python -m unittest discover tests

# Or with pytest:
pytest tests/test_all.py -v
```

### Expected Test Output:
```text
test_empty_mask_handling (test_all.TestCrackSensePipeline) ... ok
test_fea_baseline_beam_validation (test_all.TestCrackSensePipeline) ... ok
test_progression_rate_calculation (test_all.TestCrackSensePipeline) ... ok
test_synthetic_crack_geometry (test_all.TestCrackSensePipeline) ... ok

----------------------------------------------------------------------
Ran 4 tests in 0.284s

OK
```

---

## 4. Starting the Flask Backend

```powershell
# Run the development server on port 5000
python app.py
```

### Expected Console Output:
```text
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
Press CTRL+C to quit
```

---

## 5. API Endpoints Reference

| Endpoint | Method | Purpose |
|:---|:---|:---|
| `/api/health` | GET | System status & PyTorch availability check |
| `/api/detect` | POST | Image upload, segmentation inference & geometry metrics |
| `/api/fea/solve` | POST | 2D plane-stress FEA solver with analytical validation |
| `/api/progression/compare` | POST | Multi-date inspection registration & growth rate |

---

## 6. Windows 11 Troubleshooting

- **PowerShell Script Error (`UnauthorizedAccess`):**
  Run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
- **OpenCV DLL missing error (`ImportError: DLL load failed`):**
  Install the official Visual C++ Redistributable: `https://aka.ms/vs/17/release/vc_redist.x64.exe`
- **Port Conflict (Port 5000 already in use):**
  Check: `Get-NetTCPConnection -LocalPort 5000` or run on custom port: `python app.py --port 5001`
