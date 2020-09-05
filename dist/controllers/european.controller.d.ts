import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import { Vehicle } from '../vehicles/vehicle';
import { SessionController } from './controller';
export declare class EuropeanController extends SessionController {
    constructor(userConfig: BlueLinkyConfig);
    session: Session;
    private vehicles;
    private uuidv4;
    refreshAccessToken(): Promise<string>;
    enterPin(): Promise<string>;
    login(): Promise<string>;
    logout(): Promise<string>;
    getVehicles(): Promise<Array<Vehicle>>;
    asyncForEach(array: any, callback: any): Promise<any>;
}
