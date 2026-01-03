use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use crate::config::Config;

pub type DbPool = Pool<Postgres>;

pub async fn init_db(config: &Config) -> DbPool {
    PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to Postgres")
}
