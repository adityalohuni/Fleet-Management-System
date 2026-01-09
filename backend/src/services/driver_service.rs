use uuid::Uuid;
use crate::models::postgres::driver::{Driver, DriverWithUser, CreateDriverDto, DriverStatus};
use crate::repositories::postgres::driver_repo::DriverRepositoryTrait;
use crate::error::AppError;

#[cfg_attr(test, mockall::automock)]
#[async_trait::async_trait]
pub trait DriverServiceTrait: Send + Sync {
    async fn create_driver(&self, dto: CreateDriverDto) -> Result<Driver, AppError>;
    async fn get_driver(&self, id: Uuid) -> Result<DriverWithUser, AppError>;
    async fn list_drivers(&self) -> Result<Vec<DriverWithUser>, AppError>;
    async fn update_driver_status(&self, id: Uuid, status: DriverStatus) -> Result<Driver, AppError>;
    async fn delete_driver(&self, id: Uuid) -> Result<(), AppError>;
}

pub struct DriverService {
    driver_repo: Box<dyn DriverRepositoryTrait>,
}

impl DriverService {
    pub fn new(driver_repo: Box<dyn DriverRepositoryTrait>) -> Self {
        Self { driver_repo }
    }
}

#[async_trait::async_trait]
impl DriverServiceTrait for DriverService {
    async fn create_driver(&self, dto: CreateDriverDto) -> Result<Driver, AppError> {
        self.driver_repo.create(dto).await
    }

    async fn get_driver(&self, id: Uuid) -> Result<DriverWithUser, AppError> {
        let driver = self.driver_repo.find_by_id_with_user(id).await?;
        match driver {
            Some(d) => Ok(d),
            None => Err(AppError::NotFound(format!("Driver with id {} not found", id))),
        }
    }

    async fn list_drivers(&self) -> Result<Vec<DriverWithUser>, AppError> {
        self.driver_repo.find_all_with_user().await
    }

    async fn update_driver_status(&self, id: Uuid, status: DriverStatus) -> Result<Driver, AppError> {
        // Check if driver exists first
        if self.driver_repo.find_by_id(id).await?.is_none() {
            return Err(AppError::NotFound(format!("Driver with id {} not found", id)));
        }
        self.driver_repo.update_status(id, status).await
    }

    async fn delete_driver(&self, id: Uuid) -> Result<(), AppError> {
        // Check if driver exists first
        if self.driver_repo.find_by_id(id).await?.is_none() {
            return Err(AppError::NotFound(format!("Driver with id {} not found", id)));
        }
        self.driver_repo.delete(id).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::postgres::driver_repo::MockDriverRepositoryTrait;
    use mockall::predicate::*;

    #[tokio::test]
    async fn test_create_driver() {
        let mut mock_repo = MockDriverRepositoryTrait::new();
        let user_id = Uuid::new_v4();
        let dto = CreateDriverDto {
            user_id,
            license_number: "LIC-12345".to_string(),
            status: DriverStatus::Available,
        };

        let created_driver = Driver {
            id: Uuid::new_v4(),
            user_id,
            license_number: "LIC-12345".to_string(),
            status: DriverStatus::Available,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            deleted_at: None,
        };

        let created_driver_clone = created_driver.clone();
        mock_repo
            .expect_create()
            .times(1)
            .return_once(move |_| Ok(created_driver_clone));

        let service = DriverService::new(Box::new(mock_repo));
        let result = service.create_driver(dto).await;

        assert!(result.is_ok());
        let driver = result.unwrap();
        assert_eq!(driver.license_number, "LIC-12345");
    }

    #[tokio::test]
    async fn test_get_driver_found() {
        let mut mock_repo = MockDriverRepositoryTrait::new();
        let driver_id = Uuid::new_v4();
        let driver = Driver {
            id: driver_id,
            user_id: Uuid::new_v4(),
            license_number: "LIC-12345".to_string(),
            status: DriverStatus::Available,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            deleted_at: None,
        };

        mock_repo
            .expect_find_by_id()
            .with(eq(driver_id))
            .times(1)
            .return_once(move |_| Ok(Some(driver)));

        let service = DriverService::new(Box::new(mock_repo));
        let result = service.get_driver(driver_id).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap().id, driver_id);
    }

    #[tokio::test]
    async fn test_get_driver_not_found() {
        let mut mock_repo = MockDriverRepositoryTrait::new();
        let driver_id = Uuid::new_v4();

        mock_repo
            .expect_find_by_id()
            .with(eq(driver_id))
            .times(1)
            .return_once(move |_| Ok(None));

        let service = DriverService::new(Box::new(mock_repo));
        let result = service.get_driver(driver_id).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            AppError::NotFound(_) => {},
            _ => panic!("Expected NotFound error"),
        }
    }
}
