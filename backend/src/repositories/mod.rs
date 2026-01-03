pub mod postgres;
pub mod redis;

pub use postgres::vehicle_repo::VehicleRepositoryTrait;
pub use postgres::driver_repo::DriverRepositoryTrait;
pub use postgres::user_repo::UserRepositoryTrait;
pub use postgres::assignment_repo::AssignmentRepositoryTrait;
pub use postgres::telemetry_repo::TelemetryRepositoryTrait;
pub use postgres::logistics_repo::{
    RouteRepositoryTrait, ShipmentRepositoryTrait, CustomerRepositoryTrait, TransportJobRepositoryTrait
};
pub use postgres::maintenance_repo::{
    MaintenanceRecordRepositoryTrait, MaintenanceScheduleRepositoryTrait, AlertRepositoryTrait
};
