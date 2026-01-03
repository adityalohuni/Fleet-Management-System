/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Alert } from '../models/Alert';
import type { CreateMaintenanceRecordDto } from '../models/CreateMaintenanceRecordDto';
import type { MaintenanceRecord } from '../models/MaintenanceRecord';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MaintenanceService {
    /**
     * @returns Alert List of alerts
     * @throws ApiError
     */
    public static getAlerts(): CancelablePromise<Array<Alert>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/maintenance/alerts',
        });
    }
    /**
     * @param id
     * @returns Alert Alert resolved
     * @throws ApiError
     */
    public static resolveAlert(
        id: string,
    ): CancelablePromise<Alert> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/maintenance/alerts/{id}/resolve',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns MaintenanceRecord Record created
     * @throws ApiError
     */
    public static createMaintenanceRecord(
        requestBody?: CreateMaintenanceRecordDto,
    ): CancelablePromise<MaintenanceRecord> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/maintenance/records',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns MaintenanceRecord List of maintenance records
     * @throws ApiError
     */
    public static getVehicleMaintenanceRecords(
        id: string,
    ): CancelablePromise<Array<MaintenanceRecord>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/maintenance/records/vehicle/{id}',
            path: {
                'id': id,
            },
        });
    }
}
