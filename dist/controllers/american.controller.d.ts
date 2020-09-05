import { BlueLinkyConfig } from './../interfaces/common.interfaces';
import { Vehicle } from '../vehicles/vehicle';
import { SessionController } from './controller';
export declare class AmericanController extends SessionController {
    constructor(userConfig: BlueLinkyConfig);
    private vehicles;
    refreshAccessToken(): Promise<string>;
    login(): Promise<string>;
    logout(): Promise<string>;
    getVehicles(): Promise<Array<Vehicle>>;
}
