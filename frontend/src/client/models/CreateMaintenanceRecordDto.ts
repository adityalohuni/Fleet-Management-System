/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateMaintenanceRecordDto = {
    vehicle_id: string;
    type: CreateMaintenanceRecordDto.type;
    cost: string;
    date: string;
    provider: string;
    description?: string | null;
};
export namespace CreateMaintenanceRecordDto {
    export enum type {
        PREVENTIVE = 'Preventive',
        REPAIR = 'Repair',
        INSPECTION = 'Inspection',
        ACCIDENT = 'Accident',
    }
}

