/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Alert = {
    id?: string;
    entity_id?: string;
    type?: string;
    severity?: Alert.severity;
    is_resolved?: boolean;
    created_at?: string;
    resolved_at?: string | null;
};
export namespace Alert {
    export enum severity {
        LOW = 'Low',
        MEDIUM = 'Medium',
        HIGH = 'High',
        CRITICAL = 'Critical',
    }
}

