/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateAlertDto = {
    entity_id: string;
    type: string;
    severity: CreateAlertDto.severity;
};
export namespace CreateAlertDto {
    export enum severity {
        LOW = 'Low',
        MEDIUM = 'Medium',
        HIGH = 'High',
        CRITICAL = 'Critical',
    }
}

