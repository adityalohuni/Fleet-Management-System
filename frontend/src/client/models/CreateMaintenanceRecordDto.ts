/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MaintenanceType } from './MaintenanceType';
export type CreateMaintenanceRecordDto = {
    cost: string;
    date: string;
    description?: string | null;
    provider: string;
    type: MaintenanceType;
    vehicle_id: string;
};

