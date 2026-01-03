# Fleet Management Backend

This is the backend for the Fleet Management System, built with Rust and Actix Web.

## Prerequisites

- Rust (latest stable)
- PostgreSQL

## Setup

1.  Copy `.env.example` to `.env` and update the values:
    ```bash
    cp .env.example .env
    ```

2.  Create the database:
    ```bash
    createdb fleet_management
    ```
    (Or use your preferred method to create the database specified in `DATABASE_URL`)

3.  Run migrations (You need to install `sqlx-cli`):
    ```bash
    cargo install sqlx-cli
    sqlx migrate run
    ```
    *Note: Migration scripts need to be created in `migrations/` folder.*

## Running the Server

```bash
cargo run
```

The server will start at `http://127.0.0.1:8080` (or whatever is configured in `.env`).

## API Documentation

Once the server is running, you can access the API documentation at:

-   **Swagger UI**: `http://127.0.0.1:8080/swagger-ui/`
-   **OpenAPI Spec**: `http://127.0.0.1:8080/api-docs/openapi.json`

### Docker Setup

1.  Build and run with Docker Compose:
    ```bash
    docker-compose up --build
    ```

    This will start:
    -   PostgreSQL database on port 5432
    -   Backend server on port 8080

    The backend is configured to connect to the database automatically.
    *Note: The backend might restart a few times while waiting for the database to become ready.*

## API Endpoints

-   `GET /health`: Health check.
-   `GET /vehicles`: List vehicles.
-   `POST /vehicles`: Create a vehicle.
