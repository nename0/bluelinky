/// <reference types="node" />
import { EventEmitter } from 'events';
import { BlueLinkyConfig, Session } from './interfaces/common.interfaces';
import { Vehicle } from './vehicles/vehicle';
declare class BlueLinky extends EventEmitter {
    private controller;
    private vehicles;
    private config;
    constructor(config: BlueLinkyConfig);
    private onInit;
    login(): Promise<string>;
    getVehicles(): Promise<Array<Vehicle>>;
    getVehicle(input: string): Vehicle | undefined;
    refreshAccessToken(): Promise<string>;
    logout(): Promise<string>;
    getSession(): Session | null;
}
export default BlueLinky;
