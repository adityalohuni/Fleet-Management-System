use redis::AsyncCommands;
use crate::models::redis::vehicle_status::VehicleStatusCache;
use crate::error::AppError;
use uuid::Uuid;

pub struct VehicleStatusCacheRepository {
    client: redis::Client,
}

impl VehicleStatusCacheRepository {
    pub fn new(client: redis::Client) -> Self {
        Self { client }
    }

    pub async fn set(&self, status: &VehicleStatusCache) -> Result<(), AppError> {
        let mut conn = self.client.get_async_connection().await.map_err(|e| AppError::RedisError(e.to_string()))?;
        let key = format!("vehicle_status:{}", status.vehicle_id);
        let json = serde_json::to_string(status).map_err(|e| AppError::SerializationError(e.to_string()))?;
        
        conn.set::<_, _, ()>(key, json).await.map_err(|e| AppError::RedisError(e.to_string()))?;
        Ok(())
    }

    pub async fn get(&self, vehicle_id: Uuid) -> Result<Option<VehicleStatusCache>, AppError> {
        let mut conn = self.client.get_async_connection().await.map_err(|e| AppError::RedisError(e.to_string()))?;
        let key = format!("vehicle_status:{}", vehicle_id);
        
        let json: Option<String> = conn.get(key).await.map_err(|e| AppError::RedisError(e.to_string()))?;
        
        match json {
            Some(s) => {
                let status = serde_json::from_str(&s).map_err(|e| AppError::SerializationError(e.to_string()))?;
                Ok(Some(status))
            },
            None => Ok(None),
        }
    }
}
