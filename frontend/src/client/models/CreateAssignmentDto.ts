/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignmentStatus } from './AssignmentStatus';
export type CreateAssignmentDto = {
    driver_id: string;
    end_time?: string | null;
    start_time: string;
    status: AssignmentStatus;
    vehicle_id: string;
};

