# ✈️ Fleet Command Interface (FCI) - Flight Manual

**Version:** 1.0.0  
**Classification:** TOP SECRET // FLEET ADMIN EYES ONLY

## 1. Overview

Welcome to the cockpit, Commander. The **Fleet Command Interface (FCI)** is your primary instrument for controlling the Fleet Management System infrastructure. This CLI utility abstracts the complexities of Docker, Cargo, and database management into a unified, high-precision control panel.

Whether you are initiating launch sequences, performing mid-air engine restarts, or executing emergency shutdowns, the FCI provides the tactical control required for scalable operations.

## 2. Installation & Prerequisites

Ensure your local environment is equipped with the following avionics:
*   **Docker & Docker Compose:** The engine core.
*   **Rust (Cargo):** For backend diagnostics and testing.
*   **Node.js (npm/pnpm):** For frontend avionics.
*   **Bash:** The command frequency.

**Installation:**
```bash
chmod +x fleet
./fleet help
```

## 3. Command Reference

Usage: `./fleet [COMMAND] [TARGET] [OPTIONS]`

**Note:** The CLI automatically uses `sudo` for Docker commands. You may be prompted for your password.

### 🚀 Mission Control (Lifecycle)

| Command | Target | Description |
| :--- | :--- | :--- |
| `launch` | `[all]` | **System Takeoff.** Spins up the entire stack (DB, Redis, MinIO, Backend, Frontend) in detached mode. Uses `docker-compose up -d --build`. |
| `land` | `[all]` | **System Landing.** Gracefully stops all services using `docker-compose down`. |
| `abort` | `[all]` | **Emergency Stop.** Kills all containers immediately using `docker-compose kill`. |
| `nuke` | `[all]` | **Total Wipe.** Stops containers, removes volumes, and prunes networks. **DATA LOSS IMMINENT.** |

### 🛠️ Engineering (Maintenance)

| Command | Target | Description |
| :--- | :--- | :--- |
| `restart` | `<service>` | **Engine Restart.** Restarts a specific service (e.g., `backend`, `frontend`, `db`). |
| `logs` | `<service>` | **Flight Recorder.** Tails the logs of a specific service. |
| `shell` | `<service>` | **Cockpit Access.** Opens a bash/sh shell inside the running container. |
| `status` | `[all]` | **System Diagnostics.** Shows the health and status of all containers using `docker-compose ps`. |

### 🔬 Diagnostics (Testing)

| Command | Target | Description |
| :--- | :--- | :--- |
| `test` | `backend` | **Backend Diagnostics.** <br>1. Checks if `db` service is running. If not, starts infrastructure.<br>2. Runs a temporary `backend-test` container attached to the network.<br>3. Executes `cargo test` inside that container. |
| `test` | `frontend` | **Frontend Diagnostics.** Runs frontend test suite locally using `npm test`. |
| `check` | `backend` | **Pre-flight Check.** Runs `cargo check` and `cargo clippy` locally. |

### 📈 Scalability (Advanced)

| Command | Target | Description |
| :--- | :--- | :--- |
| `scale` | `<service>=<n>` | **Thrust Vectoring.** Scales a service to `n` instances (e.g., `scale backend=3`). |

## 4. Operational Scenarios

### Scenario A: Rapid Backend Iteration
You are refactoring the `VehicleRepository`. You need to restart the backend frequently and run tests.

1.  **Initial Launch:** `./fleet launch`
2.  **Code Changes:** (You edit `vehicle_repo.rs`)
3.  **Run Tests:** `./fleet test backend`
4.  **Restart Backend:** `./fleet restart backend`
5.  **Check Logs:** `./fleet logs backend`

### Scenario B: Database Reset
The database schema has changed significantly, and migrations are conflicting.

1.  **Nuclear Option:** `./fleet nuke` (Clears all data volumes)
2.  **Re-Launch:** `./fleet launch` (Fresh DB, migrations run automatically)

### Scenario C: Frontend Debugging
The frontend is acting up, and you need to see the build output.

1.  **Restart Frontend:** `./fleet restart frontend`
2.  **Watch Logs:** `./fleet logs frontend`

## 5. Troubleshooting

*   **"Connection Refused":** Ensure `launch` has completed and the `db` service is healthy (`./fleet status`).
*   **"Port Conflict":** Check if ports 8080, 5432, 6379, or 9000 are used by other processes.

---
*Authorized Personnel Only. Unauthorized use will be reported to Fleet Command.*
