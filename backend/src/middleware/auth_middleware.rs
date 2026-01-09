use std::future::{ready, Ready};
use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use futures_util::future::LocalBoxFuture;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use crate::services::auth_service::Claims;
use std::rc::Rc;
use sqlx::PgPool;
use std::sync::Arc;
use moka::future::Cache;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct UserActiveCache {
    pub is_active: bool,
}

pub struct Auth {
    pub jwt_secret: String,
    pub pool: PgPool,
    pub cache: Arc<Cache<Uuid, UserActiveCache>>,
}

impl<S, B> Transform<S, ServiceRequest> for Auth
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = AuthMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(AuthMiddleware {
            service: Rc::new(service),
            jwt_secret: self.jwt_secret.clone(),
            pool: self.pool.clone(),
            cache: self.cache.clone(),
        }))
    }
}

pub struct AuthMiddleware<S> {
    service: Rc<S>,
    jwt_secret: String,
    pool: PgPool,
    cache: Arc<Cache<Uuid, UserActiveCache>>,
}

impl<S, B> Service<ServiceRequest> for AuthMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let srv = self.service.clone();
        let jwt_secret = self.jwt_secret.clone();
        let pool = self.pool.clone();
        let cache = self.cache.clone();

        Box::pin(async move {
            let auth_header = req.headers().get("Authorization");

            if let Some(auth_header) = auth_header {
                if let Ok(auth_str) = auth_header.to_str() {
                    if auth_str.starts_with("Bearer ") {
                        let token = &auth_str[7..];
                        let validation = Validation::new(Algorithm::HS256);
                        let key = DecodingKey::from_secret(jwt_secret.as_bytes());

                        match decode::<Claims>(token, &key, &validation) {
                            Ok(token_data) => {
                                let claims = token_data.claims.clone();
                                let user_id = claims.user_id;
                                
                                // Check cache first - assume active if cached
                                if let Some(_cached) = cache.get(&user_id).await {
                                    // User is cached as active
                                    req.extensions_mut().insert(claims);
                                    return srv.call(req).await;
                                }
                                
                                // Not in cache, query database
                                match sqlx::query_scalar::<_, bool>(
                                    "SELECT is_active FROM users WHERE id = $1 AND deleted_at IS NULL"
                                )
                                .bind(user_id)
                                .fetch_optional(&pool)
                                .await
                                {
                                    Ok(Some(true)) => {
                                        // User is active, cache it
                                        let _ = cache.insert(
                                            user_id,
                                            UserActiveCache { is_active: true },
                                        ).await;
                                        req.extensions_mut().insert(claims);
                                        return srv.call(req).await;
                                    }
                                    Ok(Some(false)) => {
                                        // User is inactive
                                        return Err(actix_web::error::ErrorForbidden("User account is inactive"));
                                    }
                                    Ok(None) => {
                                        // User not found
                                        return Err(actix_web::error::ErrorUnauthorized("User not found"));
                                    }
                                    Err(_) => {
                                        // Database error, deny access
                                        return Err(actix_web::error::ErrorInternalServerError("Failed to verify user status"));
                                    }
                                }
                            }
                            Err(_) => {
                                return Err(actix_web::error::ErrorUnauthorized("Invalid token"));
                            }
                        }
                    }
                }
            }

            Err(actix_web::error::ErrorUnauthorized("Missing or invalid Authorization header"))
        })
    }
}

/// Invalidate cache entry for a user after deactivation
pub async fn invalidate_user_cache(
    cache: &Arc<Cache<Uuid, UserActiveCache>>,
    user_id: Uuid,
) {
    cache.invalidate(&user_id).await;
}
