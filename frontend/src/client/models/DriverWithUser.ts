/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DriverStatus } from './DriverStatus';
export type DriverWithUser = {
    created_at: string;
    email: string;
    id: string;
    license_expiry?: string | null;
    license_number: string;
    name?: string | null;
    phone?: string | null;
    status: DriverStatus;
    updated_at: string;
    user_id: string;
    wage_rate?: string | null;
};

