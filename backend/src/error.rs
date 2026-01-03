use actix_web::{HttpResponse, ResponseError};
use derive_more::Display;

#[derive(Debug, Display)]
pub enum AppError {
    #[display(fmt = "Internal Server Error: {}", _0)]
    InternalServerError(String),

    #[display(fmt = "BadRequest: {}", _0)]
    BadRequest(String),

    #[display(fmt = "AuthError: {}", _0)]
    AuthError(String),

    #[display(fmt = "NotFound: {}", _0)]
    NotFound(String),

    #[display(fmt = "DatabaseError: {}", _0)]
    DatabaseError(sqlx::Error),

    #[display(fmt = "RedisError: {}", _0)]
    RedisError(String),

    #[display(fmt = "SerializationError: {}", _0)]
    SerializationError(String),

    #[display(fmt = "ValidationError: {:?}", _0)]
    ValidationError(validator::ValidationErrors),
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        match self {
            AppError::InternalServerError(ref message) => {
                eprintln!("Internal Server Error: {}", message);
                HttpResponse::InternalServerError().json("Internal Server Error")
            }
            AppError::AuthError(ref message) => HttpResponse::Unauthorized().json(message),
            AppError::BadRequest(ref message) => HttpResponse::BadRequest().json(message),
            AppError::NotFound(ref message) => HttpResponse::NotFound().json(message),
            AppError::ValidationError(ref errors) => HttpResponse::BadRequest().json(errors),
            AppError::DatabaseError(ref message) => {
                // In production, we shouldn't leak DB errors to the client
                eprintln!("Database error: {:?}", message);
                HttpResponse::InternalServerError().json("Internal Server Error")
            }
            AppError::RedisError(ref message) => {
                eprintln!("Redis error: {:?}", message);
                HttpResponse::InternalServerError().json("Internal Server Error")
            }
            AppError::SerializationError(ref message) => {
                eprintln!("Serialization error: {:?}", message);
                HttpResponse::InternalServerError().json("Internal Server Error")
            }
        }
    }
}
