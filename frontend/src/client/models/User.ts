/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
export type User = {
    created_at: string;
    deleted_at?: string | null;
    email: string;
    id: string;
    is_active: boolean;
    name?: string | null;
    role: UserRole;
    updated_at: string;
};

