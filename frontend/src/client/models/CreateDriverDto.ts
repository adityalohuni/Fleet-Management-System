/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateDriverDto = {
    name: string;
    status: CreateDriverDto.status;
    license_number: string;
};
export namespace CreateDriverDto {
    export enum status {
        ACTIVE = 'Active',
        INACTIVE = 'Inactive',
        ON_LEAVE = 'OnLeave',
    }
}

