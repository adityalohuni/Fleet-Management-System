/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignmentStatus } from './AssignmentStatus';
export type VehicleAssignment = {
    created_at: string;
    driver_id: string;
    end_time?: string | null;
    id: string;
    start_time: string;
    status: AssignmentStatus;
    updated_at: string;
    vehicle_id: string;
};

