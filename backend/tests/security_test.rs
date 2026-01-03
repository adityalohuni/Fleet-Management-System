use actix_web::{test, web, App, HttpResponse};
use actix_web::dev::Service;
use fleet_management_backend::middleware::auth_middleware::Auth;
use fleet_management_backend::services::auth_service::Claims;
use fleet_management_backend::models::postgres::user::UserRole;
use jsonwebtoken::{encode, Header, EncodingKey};
use uuid::Uuid;
use chrono::{Utc, Duration};

#[actix_web::test]
async fn test_protected_route_no_token() {
    let app = test::init_service(
        App::new()
            .service(
                web::scope("/protected")
                    .wrap(Auth { jwt_secret: "secret".to_string() })
                    .route("", web::get().to(|| HttpResponse::Ok()))
            )
    ).await;

    let req = test::TestRequest::get()
        .uri("/protected")
        .to_request();

    // call_service panics on error, so we use call directly
    let resp = app.call(req).await;
    assert!(resp.is_err());
    let err = resp.unwrap_err();
    let resp = err.error_response();
    assert_eq!(resp.status(), actix_web::http::StatusCode::UNAUTHORIZED);
}

#[actix_web::test]
async fn test_protected_route_invalid_token() {
    let app = test::init_service(
        App::new()
            .service(
                web::scope("/protected")
                    .wrap(Auth { jwt_secret: "secret".to_string() })
                    .route("", web::get().to(|| HttpResponse::Ok()))
            )
    ).await;

    let req = test::TestRequest::get()
        .uri("/protected")
        .insert_header(("Authorization", "Bearer invalid_token"))
        .to_request();

    let resp = app.call(req).await;
    assert!(resp.is_err());
    let err = resp.unwrap_err();
    let resp = err.error_response();
    assert_eq!(resp.status(), actix_web::http::StatusCode::UNAUTHORIZED);
}

#[actix_web::test]
async fn test_protected_route_valid_token() {
    let jwt_secret = "secret";
    let app = test::init_service(
        App::new()
            .service(
                web::scope("/protected")
                    .wrap(Auth { jwt_secret: jwt_secret.to_string() })
                    .route("", web::get().to(|| HttpResponse::Ok()))
            )
    ).await;

    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(1))
        .unwrap()
        .timestamp();

    let claims = Claims {
        sub: Uuid::new_v4(),
        role: UserRole::Driver,
        exp: expiration as usize,
    };

    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.as_bytes())).unwrap();

    let req = test::TestRequest::get()
        .uri("/protected")
        .insert_header(("Authorization", format!("Bearer {}", token)))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}
