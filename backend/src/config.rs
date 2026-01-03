use serde::Deserialize;
use dotenv::dotenv;
use std::env;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub database_url: String,
    pub server_address: String,
    pub jwt_secret: String,
}

impl Config {
    pub fn init() -> Config {
        dotenv().ok();
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let server_address = env::var("SERVER_ADDRESS").unwrap_or_else(|_| "127.0.0.1:8080".to_string());
        let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "secret".to_string());

        Config {
            database_url,
            server_address,
            jwt_secret,
        }
    }
}
