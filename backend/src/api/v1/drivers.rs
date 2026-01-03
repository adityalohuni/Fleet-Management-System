use actix_web::{web, HttpResponse};
use crate::services::driver_service::DriverServiceTrait;
use crate::api::dto::driver_dto::{CreateDriverRequest, DriverResponse, UpdateDriverStatusRequest};
use crate::models::postgres::driver::CreateDriverDto;
use crate::error::AppError;
use validator::Validate;
use uuid::Uuid;

#[utoipa::path(
    get,
    path = "/api/v1/drivers",
    responses(
        (status = 200, description = "List all drivers", body = Vec<DriverResponse>)
    )
)]
pub async fn get_drivers(service: web::Data<dyn DriverServiceTrait>) -> Result<HttpResponse, AppError> {
    let drivers = service.list_drivers().await?;
    let response: Vec<DriverResponse> = drivers.into_iter().map(DriverResponse::from).collect();
    Ok(HttpResponse::Ok().json(response))
}

#[utoipa::path(
    get,
    path = "/api/v1/drivers/{id}",
    responses(
        (status = 200, description = "Get driver by ID", body = DriverResponse),
        (status = 404, description = "Driver not found")
    )
)]
pub async fn get_driver(
    path: web::Path<Uuid>,
    service: web::Data<dyn DriverServiceTrait>
) -> Result<HttpResponse, AppError> {
    let driver = service.get_driver(path.into_inner()).await?;
    Ok(HttpResponse::Ok().json(DriverResponse::from(driver)))
}

#[utoipa::path(
    post,
    path = "/api/v1/drivers",
    request_body = CreateDriverRequest,
    responses(
        (status = 201, description = "Driver created", body = DriverResponse),
        (status = 400, description = "Validation error")
    )
)]
pub async fn create_driver(
    service: web::Data<dyn DriverServiceTrait>,
    item: web::Json<CreateDriverRequest>,
) -> Result<HttpResponse, AppError> {
    item.validate().map_err(|e| AppError::ValidationError(e))?;
    
    let req = item.into_inner();
    let dto = CreateDriverDto {
        user_id: req.user_id,
        license_number: req.license_number,
        status: req.status,
    };

    let driver = service.create_driver(dto).await?;
    Ok(HttpResponse::Created().json(DriverResponse::from(driver)))
}

#[utoipa::path(
    patch,
    path = "/api/v1/drivers/{id}/status",
    request_body = UpdateDriverStatusRequest,
    responses(
        (status = 200, description = "Driver status updated", body = DriverResponse),
        (status = 404, description = "Driver not found")
    )
)]
pub async fn update_driver_status(
    path: web::Path<Uuid>,
    service: web::Data<dyn DriverServiceTrait>,
    item: web::Json<UpdateDriverStatusRequest>,
) -> Result<HttpResponse, AppError> {
    let driver = service.update_driver_status(path.into_inner(), item.status).await?;
    Ok(HttpResponse::Ok().json(DriverResponse::from(driver)))
}

#[utoipa::path(
    delete,
    path = "/api/v1/drivers/{id}",
    responses(
        (status = 204, description = "Driver deleted"),
        (status = 404, description = "Driver not found")
    )
)]
pub async fn delete_driver(
    path: web::Path<Uuid>,
    service: web::Data<dyn DriverServiceTrait>,
) -> Result<HttpResponse, AppError> {
    service.delete_driver(path.into_inner()).await?;
    Ok(HttpResponse::NoContent().finish())
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/drivers")
            .route("", web::get().to(get_drivers))
            .route("", web::post().to(create_driver))
            .route("/{id}", web::get().to(get_driver))
            .route("/{id}", web::delete().to(delete_driver))
            .route("/{id}/status", web::patch().to(update_driver_status))
    );
}
