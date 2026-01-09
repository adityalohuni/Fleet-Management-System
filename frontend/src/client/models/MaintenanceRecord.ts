/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MaintenanceType } from './MaintenanceType';
export type MaintenanceRecord = {
    cost: string;
    created_at: string;
    date: string;
    description?: string | null;
    id: string;
    provider: string;
    type: MaintenanceType;
    vehicle_id: string;
};

