use actix_web::{web, HttpResponse, Responder, HttpMessage, HttpRequest};
use crate::services::auth_service::{AuthServiceTrait, LoginDto, Claims, AuthResponse};
use crate::models::postgres::user::CreateUserDto;

#[utoipa::path(
    post,
    path = "/api/auth/register",
    request_body = CreateUserDto,
    responses(
        (status = 200, description = "User registered successfully", body = AuthResponse),
        (status = 500, description = "Internal Server Error")
    )
)]
pub async fn register(
    service: web::Data<dyn AuthServiceTrait>,
    dto: web::Json<CreateUserDto>,
) -> impl Responder {
    let result = service.register(dto.into_inner()).await;
    match result {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[utoipa::path(
    post,
    path = "/api/auth/login",
    request_body = LoginDto,
    responses(
        (status = 200, description = "User logged in successfully", body = AuthResponse),
        (status = 401, description = "Unauthorized")
    )
)]
pub async fn login(
    service: web::Data<dyn AuthServiceTrait>,
    dto: web::Json<LoginDto>,
) -> impl Responder {
    let result = service.login(dto.into_inner()).await;
    match result {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => HttpResponse::Unauthorized().body(e.to_string()),
    }
}

#[utoipa::path(
    get,
    path = "/api/auth/me",
    responses(
        (status = 200, description = "Current user info", body = Claims),
        (status = 401, description = "Unauthorized")
    ),
    security(
        ("jwt" = [])
    )
)]
pub async fn me(req: HttpRequest) -> impl Responder {
    if let Some(claims) = req.extensions().get::<Claims>() {
        HttpResponse::Ok().json(claims)
    } else {
        HttpResponse::Unauthorized().body("Unauthorized")
    }
}

pub fn config_public(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/register", web::post().to(register))
            .route("/login", web::post().to(login))
    );
}

pub fn config_protected(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/me", web::get().to(me))
    );
}
