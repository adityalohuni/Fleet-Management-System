use fleet_management_backend::{config, db, routes};
use fleet_management_backend::repositories::postgres::vehicle_repo::VehicleRepository;
use fleet_management_backend::services::vehicle_service::{VehicleService, VehicleServiceTrait};
use fleet_management_backend::repositories::postgres::driver_repo::DriverRepository;
use fleet_management_backend::services::driver_service::{DriverService, DriverServiceTrait};
use fleet_management_backend::repositories::postgres::assignment_repo::AssignmentRepository;
use fleet_management_backend::services::assignment_service::{AssignmentService, AssignmentServiceTrait};
use fleet_management_backend::repositories::postgres::maintenance_repo::{MaintenanceRecordRepository, MaintenanceScheduleRepository, AlertRepository};
use fleet_management_backend::services::maintenance_service::{MaintenanceService, MaintenanceServiceTrait};
use fleet_management_backend::repositories::postgres::logistics_repo::{CustomerRepository, TransportJobRepository, RouteRepository, ShipmentRepository};
use fleet_management_backend::services::logistics_service::{LogisticsService, LogisticsServiceTrait};
use fleet_management_backend::repositories::postgres::telemetry_repo::TelemetryRepository;
use fleet_management_backend::services::telemetry_service::{TelemetryService, TelemetryServiceTrait};
use fleet_management_backend::repositories::postgres::financial_repo::FinancialRepository;
use fleet_management_backend::services::financial_service::{FinancialService, FinancialServiceTrait};
use fleet_management_backend::repositories::postgres::user_repo::UserRepository;
use fleet_management_backend::repositories::postgres::settings_repo::SettingsRepository;
use fleet_management_backend::services::auth_service::{AuthService, AuthServiceTrait};
use fleet_management_backend::services::settings_service::{SettingsService, SettingsServiceTrait};
use fleet_management_backend::services::user_service::{UserService, UserServiceTrait};
use fleet_management_backend::middleware::auth_middleware::{self, Auth};
use fleet_management_backend::api_docs::ApiDoc;
use actix_web::{web, App, HttpServer, HttpResponse, Responder};
use actix_cors::Cors;
use dotenv::dotenv;
use env_logger;
use std::sync::Arc;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use uuid::Uuid;
use moka::future::Cache;
use std::time::Duration;

async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("Fleet Management Backend is running!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let config = config::Config::init();
    let pool = db::init_db(&config).await;

    // Run migrations automatically on startup
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    // Initialize user active status cache with 5-minute TTL
    let user_active_cache: Arc<Cache<Uuid, auth_middleware::UserActiveCache>> = Arc::new(
        Cache::builder()
            .time_to_live(Duration::from_secs(300))
            .build()
    );

    println!("Server running at http://{}", config.server_address);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        let vehicle_repo = Box::new(VehicleRepository::new(pool.clone()));
        let vehicle_service: Arc<dyn VehicleServiceTrait> = Arc::new(VehicleService::new(vehicle_repo));
        let vehicle_service_data = web::Data::from(vehicle_service);

        let driver_repo = Box::new(DriverRepository::new(pool.clone()));
        let driver_service: Arc<dyn DriverServiceTrait> = Arc::new(DriverService::new(driver_repo));
        let driver_service_data = web::Data::from(driver_service);

        // Assignment Service
        let assignment_repo = Arc::new(AssignmentRepository::new(pool.clone()));
        let vehicle_repo_for_assignment = Arc::new(VehicleRepository::new(pool.clone()));
        let driver_repo_for_assignment = Arc::new(DriverRepository::new(pool.clone()));
        
        let assignment_service: Arc<dyn AssignmentServiceTrait> = Arc::new(AssignmentService::new(
            assignment_repo,
            vehicle_repo_for_assignment,
            driver_repo_for_assignment,
        ));
        let assignment_service_data = web::Data::from(assignment_service);

        // Maintenance Service
        let maintenance_record_repo = Arc::new(MaintenanceRecordRepository::new(pool.clone()));
        let maintenance_schedule_repo = Arc::new(MaintenanceScheduleRepository::new(pool.clone()));
        let alert_repo = Arc::new(AlertRepository::new(pool.clone()));
        
        let maintenance_service: Arc<dyn MaintenanceServiceTrait> = Arc::new(MaintenanceService::new(
            maintenance_record_repo,
            maintenance_schedule_repo,
            alert_repo,
        ));
        let maintenance_service_data = web::Data::from(maintenance_service);

        // Logistics Service
        let customer_repo = Arc::new(CustomerRepository::new(pool.clone()));
        let job_repo = Arc::new(TransportJobRepository::new(pool.clone()));
        let route_repo = Arc::new(RouteRepository::new(pool.clone()));
        let shipment_repo = Arc::new(ShipmentRepository::new(pool.clone()));

        let logistics_service: Arc<dyn LogisticsServiceTrait> = Arc::new(LogisticsService::new(
            customer_repo,
            job_repo,
            route_repo,
            shipment_repo,
        ));
        let logistics_service_data = web::Data::from(logistics_service);

        // Telemetry Service
        let telemetry_repo = Arc::new(TelemetryRepository::new(pool.clone()));
        let telemetry_service: Arc<dyn TelemetryServiceTrait> = Arc::new(TelemetryService::new(telemetry_repo));
        let telemetry_service_data = web::Data::from(telemetry_service);

        // Financial Service
        let financial_repo = Arc::new(FinancialRepository::new(pool.clone()));
        let financial_service: Arc<dyn FinancialServiceTrait> = Arc::new(FinancialService::new(financial_repo));
        let financial_service_data = web::Data::from(financial_service);

        // Auth Service
        let user_repo = Box::new(UserRepository::new(pool.clone()));
        let auth_service: Arc<dyn AuthServiceTrait> = Arc::new(AuthService::new(user_repo, config.jwt_secret.clone()));
        let auth_service_data = web::Data::from(auth_service);

        // Settings Service
        let settings_repo = Arc::new(SettingsRepository::new(pool.clone()));
        let settings_service: Arc<dyn SettingsServiceTrait> = Arc::new(SettingsService::new(settings_repo));
        let settings_service_data = web::Data::from(settings_service);

        // User Service
        let user_repo2 = Arc::new(UserRepository::new(pool.clone()));
        let user_service: Arc<dyn UserServiceTrait> = Arc::new(UserService::new(user_repo2));
        let user_service_data = web::Data::from(user_service);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::from(user_active_cache.clone()))
            .app_data(vehicle_service_data)
            .app_data(driver_service_data)
            .app_data(assignment_service_data)
            .app_data(maintenance_service_data)
            .app_data(logistics_service_data)
            .app_data(telemetry_service_data)
            .app_data(financial_service_data)
            .app_data(auth_service_data)
            .app_data(settings_service_data)
            .app_data(user_service_data)
            .service(
                SwaggerUi::new("/swagger-ui/{_:.*}")
                    .url("/api-docs/openapi.json", ApiDoc::openapi())
            )
            .route("/health", web::get().to(health_check))
            .service(
                web::scope("/api")
                    .configure(routes::vehicle::config)
                    .configure(routes::driver::config)
                    .configure(routes::assignment::config)
                    .configure(routes::maintenance::config)
                    .configure(routes::logistics::config)
                    .configure(routes::telemetry::config)
                    .configure(routes::financial::config)
                    .configure(routes::auth::config_public)
                    .service(
                        web::scope("")
                            .wrap(Auth {
                                jwt_secret: config.jwt_secret.clone(),
                                pool: pool.clone(),
                                cache: user_active_cache.clone(),
                            })
                            .configure(routes::auth::config_protected)
                            .configure(routes::settings::config)
                            .configure(routes::users::config)
                    )
            )
    })
    .bind(&config.server_address)?
    .run()
    .await
}
