/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlertSeverity } from './AlertSeverity';
export type Alert = {
    created_at: string;
    entity_id: string;
    id: string;
    is_resolved: boolean;
    resolved_at?: string | null;
    severity: AlertSeverity;
    type: string;
};

