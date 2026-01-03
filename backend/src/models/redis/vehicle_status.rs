use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct VehicleStatusCache {
    pub vehicle_id: Uuid,
    pub speed: f64,
    pub latitude: f64,
    pub longitude: f64,
    pub driver_id: Option<Uuid>,
    pub last_updated: i64, // Timestamp
}
