/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MaintenanceRecord = {
    id?: string;
    vehicle_id?: string;
    type?: MaintenanceRecord.type;
    cost?: string;
    date?: string;
    provider?: string;
    description?: string | null;
    created_at?: string;
};
export namespace MaintenanceRecord {
    export enum type {
        PREVENTIVE = 'Preventive',
        REPAIR = 'Repair',
        INSPECTION = 'Inspection',
        ACCIDENT = 'Accident',
    }
}

