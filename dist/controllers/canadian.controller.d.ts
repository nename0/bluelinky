import { AccountInfo, BlueLinkyConfig, PreferedDealer } from '../interfaces/common.interfaces';
import { Vehicle } from '../vehicles/vehicle';
import { SessionController } from './controller';
export declare class CanadianController extends SessionController {
    private _preferredDealer;
    private _accountInfo;
    constructor(userConfig: BlueLinkyConfig);
    private vehicles;
    private timeOffset;
    refreshAccessToken(): Promise<string>;
    login(): Promise<string>;
    logout(): Promise<string>;
    getVehicles(): Promise<Array<Vehicle>>;
    myAccount(): Promise<AccountInfo>;
    preferedDealer(): Promise<PreferedDealer>;
    private request;
}
