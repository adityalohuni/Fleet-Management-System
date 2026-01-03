use utoipa::{OpenApi, Modify};
use utoipa::openapi::security::{SecurityScheme, HttpBuilder, HttpAuthScheme};
use crate::models::postgres::{
    vehicle::{Vehicle, CreateVehicleDto, VehicleType, VehicleStatus, FuelType},
    user::{User, CreateUserDto, UserRole, Role},
    driver::{Driver, CreateDriverDto, DriverStatus},
    assignment::{VehicleAssignment, CreateAssignmentDto, AssignmentStatus},
    maintenance::{MaintenanceRecord, CreateMaintenanceRecordDto, MaintenanceType, Alert, CreateAlertDto, AlertSeverity},
    logistics::{Customer, CreateCustomerDto, TransportJob, CreateTransportJobDto, JobStatus, Route, CreateRouteDto, Shipment, CreateShipmentDto},
    telemetry::{VehicleTelemetry, CreateVehicleTelemetryDto},
    financial::{MonthlyFinancialSummary, VehicleProfitability},
};
use crate::services::auth_service::{LoginDto, AuthResponse, Claims};

pub struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        let components = openapi.components.as_mut().unwrap(); 
        components.add_security_scheme(
            "jwt",
            SecurityScheme::Http(
                HttpBuilder::new()
                    .scheme(HttpAuthScheme::Bearer)
                    .bearer_format("JWT")
                    .description(Some("JWT Authorization header using the Bearer scheme."))
                    .build(),
            ),
        );
    }
}

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::routes::auth::register,
        crate::routes::auth::login,
        crate::routes::auth::me
    ),
    components(
        schemas(
            Vehicle, CreateVehicleDto, VehicleType, VehicleStatus, FuelType,
            User, CreateUserDto, UserRole, Role,
            Driver, CreateDriverDto, DriverStatus,
            VehicleAssignment, CreateAssignmentDto, AssignmentStatus,
            MaintenanceRecord, CreateMaintenanceRecordDto, MaintenanceType, Alert, CreateAlertDto, AlertSeverity,
            Customer, CreateCustomerDto, TransportJob, CreateTransportJobDto, JobStatus, Route, CreateRouteDto, Shipment, CreateShipmentDto,
            VehicleTelemetry, CreateVehicleTelemetryDto,
            MonthlyFinancialSummary, VehicleProfitability,
            LoginDto, AuthResponse, Claims
        )
    ),
    modifiers(&SecurityAddon),
    tags(
        (name = "fleet-management", description = "Fleet Management System API")
    )
)]
pub struct ApiDoc;
