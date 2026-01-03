# Build stage
FROM rust:1.92-slim-bookworm as builder

WORKDIR /usr/src/app

# Install build dependencies (needed for some crates like sqlx with native-tls/openssl if used, or just general build tools)
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs and lib.rs to build dependencies only (caching layer)
# This is a common trick in Rust Dockerfiles to cache dependencies
RUN mkdir src && \
    echo "fn main() {println!(\"if you see this, the build broke\")}" > src/main.rs && \
    echo "" > src/lib.rs && \
    cargo build --release && \
    rm -rf src

# Copy source code
COPY . .

# Touch main.rs and lib.rs to force rebuild of the app itself
# (The previous build command built the dummy main.rs and lib.rs, so cargo thinks it's done)
# We need to update the timestamp of the source file so cargo rebuilds it.
# However, since we removed src/main.rs and copied the real one, it should be fine.
# But sometimes the mtime of the copied file is older than the build artifact.
# To be safe:
RUN touch src/main.rs src/lib.rs

# Build the application
# We need sqlx offline mode or a running DB to compile queries if using sqlx macros without offline mode.
# Since we don't have the DB here, we should ideally use sqlx prepare.
# However, for simplicity in this setup, we might need to rely on SQLX_OFFLINE=true and a prepared json file,
# OR just let it connect if we can (we can't easily in build stage without network tricks).
# The easiest way for a quick start without `sqlx prepare` is to NOT use compile-time verification if possible,
# but sqlx macros enforce it.
# 
# Strategy: We will assume the user will run `cargo sqlx prepare` before building if they want offline mode.
# OR we can try to run the migration during build if we had the DB.
# 
# For now, let's assume we will use SQLX_OFFLINE=true. 
# The user needs to generate sqlx-data.json.
# If that file doesn't exist, the build might fail if we don't have a DB connection.
# 
# ALTERNATIVE: We can just build it. If the user hasn't run `cargo sqlx prepare`, this will fail.
# Let's add a note or try to handle it.
# Actually, for a dev setup, we can just copy the source and build.
# If we want to skip the check, we can set SQLX_OFFLINE=true, but we need the .sqlx directory.
# 
# Let's try to build. If it fails, we'll need to instruct the user to run `cargo sqlx prepare`.

RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/bin

COPY --from=builder /usr/src/app/target/release/fleet_management_backend .

# Expose the port
EXPOSE 8080

# Run the binary
CMD ["./fleet_management_backend"]
