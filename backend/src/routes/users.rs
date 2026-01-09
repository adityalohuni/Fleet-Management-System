use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use utoipa::ToSchema;
use crate::services::user_service::UserServiceTrait;
use crate::models::postgres::user::{CreateUserDto, UserRole};
use crate::middleware::auth_middleware::{UserActiveCache, invalidate_user_cache};
use moka::future::Cache;
use std::sync::Arc;

#[derive(Debug, Serialize)]
struct PublicUser {
    id: Uuid,
    email: String,
    name: Option<String>,
    role: String,
    is_active: bool,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateUserRequest {
    pub email: String,
    pub password: String,
    pub role: UserRole,
    pub name: Option<String>,
    pub is_active: bool,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateUserRequest {
    pub role: UserRole,
    pub is_active: bool,
}

pub async fn list_users(service: web::Data<dyn UserServiceTrait>) -> impl Responder {
    match service.list_users().await {
        Ok(users) => {
            let public_users: Vec<PublicUser> = users
                .into_iter()
                .map(|u| PublicUser {
                    id: u.id,
                    email: u.email,
                    name: u.name,
                    role: format!("{:?}", u.role),
                    is_active: u.is_active,
                })
                .collect();
            HttpResponse::Ok().json(public_users)
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_user(service: web::Data<dyn UserServiceTrait>, path: web::Path<Uuid>) -> impl Responder {
    match service.get_user(path.into_inner()).await {
        Ok(user) => HttpResponse::Ok().json(PublicUser {
            id: user.id,
            email: user.email,
            name: user.name,
            role: format!("{:?}", user.role),
            is_active: user.is_active,
        }),
        Err(e) => HttpResponse::NotFound().body(e.to_string()),
    }
}

pub async fn create_user(
    service: web::Data<dyn UserServiceTrait>,
    dto: web::Json<CreateUserRequest>,
) -> impl Responder {
    let dto = dto.into_inner();
    let create_dto = CreateUserDto {
        email: dto.email,
        password_hash: dto.password,
        role: dto.role,
        name: dto.name,
        is_active: dto.is_active,
    };

    match service.create_user(create_dto).await {
        Ok(user) => HttpResponse::Ok().json(PublicUser {
            id: user.id,
            email: user.email,
            name: user.name,
            role: format!("{:?}", user.role),
            is_active: user.is_active,
        }),
        Err(e) => HttpResponse::BadRequest().body(e.to_string()),
    }
}

pub async fn update_user(
    service: web::Data<dyn UserServiceTrait>,
    cache: web::Data<Arc<Cache<Uuid, UserActiveCache>>>,
    path: web::Path<Uuid>,
    dto: web::Json<UpdateUserRequest>,
) -> impl Responder {
    let id = path.into_inner();
    let dto = dto.into_inner();
    
    match service.update_user(id, dto.role, dto.is_active).await {
        Ok(user) => {
            // If user is being deactivated, invalidate their cache
            if !dto.is_active {
                invalidate_user_cache(&cache, id).await;
            }
            HttpResponse::Ok().json(PublicUser {
                id: user.id,
                email: user.email,
                name: user.name,
                role: format!("{:?}", user.role),
                is_active: user.is_active,
            })
        }
        Err(e) => HttpResponse::BadRequest().body(e.to_string()),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/users")
            .route("", web::get().to(list_users))
            .route("", web::post().to(create_user))
            .route("/{id}", web::get().to(get_user))
            .route("/{id}", web::put().to(update_user))
    );
}
