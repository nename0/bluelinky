"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = __importDefault(require("got"));
const logger_1 = __importDefault(require("../logger"));
const constants_1 = require("../constants");
const canada_1 = require("../constants/canada");
const vehicle_1 = require("./vehicle");
class CanadianVehicle extends vehicle_1.Vehicle {
    constructor(vehicleConfig, controller) {
        super(vehicleConfig, controller);
        this.vehicleConfig = vehicleConfig;
        this.controller = controller;
        this._nextService = null;
        this._info = null;
        this._features = null;
        this._featuresModel = null;
        this.region = constants_1.REGIONS.CA;
        this.timeOffset = -(new Date().getTimezoneOffset() / 60);
        logger_1.default.debug(`CA Vehicle ${this.vehicleConfig.id} created`);
    }
    //////////////////////////////////////////////////////////////////////////////
    // Vehicle
    //////////////////////////////////////////////////////////////////////////////
    async vehicleInfo() {
        logger_1.default.debug('Begin vehicleInfo request');
        try {
            const response = await this.request(canada_1.CA_ENDPOINTS.vehicleInfo, {});
            const vehicleInfoResponse = response.result;
            this._info = vehicleInfoResponse.vehicleInfo;
            this._status = vehicleInfoResponse.status;
            this._features = vehicleInfoResponse.features;
            this._featuresModel = vehicleInfoResponse.featuresModel;
            return Promise.resolve(vehicleInfoResponse);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    async status(input) {
        const statusConfig = {
            ...constants_1.DEFAULT_VEHICLE_STATUS_OPTIONS,
            ...input,
        };
        logger_1.default.debug('Begin status request, polling car: ' + input.refresh);
        try {
            const endpoint = statusConfig.refresh ? canada_1.CA_ENDPOINTS.remoteStatus : canada_1.CA_ENDPOINTS.status;
            const response = await this.request(endpoint, {});
            const vehicleStatus = response.result;
            const parsedStatus = {
                chassis: {
                    hoodOpen: vehicleStatus.hoodOpen,
                    trunkOpen: vehicleStatus.trunkOpen,
                    locked: vehicleStatus.doorLock,
                    openDoors: {
                        frontRight: !!vehicleStatus.doorOpen.frontRight,
                        frontLeft: !!vehicleStatus.doorOpen.frontLeft,
                        backLeft: !!vehicleStatus.doorOpen.backLeft,
                        backRight: !!vehicleStatus.doorOpen.backRight,
                    },
                    tirePressureWarningLamp: {
                        rearLeft: !!vehicleStatus.tirePressureLamp.tirePressureWarningLampRearLeft,
                        frontLeft: !!vehicleStatus.tirePressureLamp.tirePressureWarningLampFrontLeft,
                        frontRight: !!vehicleStatus.tirePressureLamp.tirePressureWarningLampFrontRight,
                        rearRight: !!vehicleStatus.tirePressureLamp.tirePressureWarningLampRearRight,
                        all: !!vehicleStatus.tirePressureLamp.tirePressureWarningLampAll,
                    },
                },
                climate: {
                    active: vehicleStatus.airCtrlOn,
                    steeringwheelHeat: !!vehicleStatus.steerWheelHeat,
                    sideMirrorHeat: false,
                    rearWindowHeat: !!vehicleStatus.sideBackWindowHeat,
                    defrost: vehicleStatus.defrost,
                    temperatureSetpoint: vehicleStatus.airTemp.value,
                    temperatureUnit: vehicleStatus.airTemp.unit,
                },
                engine: {
                    ignition: vehicleStatus.engine,
                    adaptiveCruiseControl: vehicleStatus.acc,
                    range: vehicleStatus.dte.value,
                    charging: vehicleStatus?.evStatus?.batteryCharge,
                    batteryCharge: vehicleStatus?.battery?.batSoc,
                },
            };
            this._status = input.parsed ? parsedStatus : vehicleStatus;
            return Promise.resolve(this._status);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    async nextService() {
        logger_1.default.debug('Begin nextService request');
        try {
            const response = await this.request(canada_1.CA_ENDPOINTS.nextService, {});
            this._nextService = response.result;
            return Promise.resolve(this._nextService);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    //////////////////////////////////////////////////////////////////////////////
    // Car commands with preauth (PIN)
    //////////////////////////////////////////////////////////////////////////////
    async lock() {
        logger_1.default.debug('Begin lock request');
        try {
            const preAuth = await this.getPreAuth();
            // assuming the API returns a bad status code for failed attempts
            await this.request(canada_1.CA_ENDPOINTS.lock, {}, { pAuth: preAuth });
            return Promise.resolve('Lock successful');
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    async unlock() {
        logger_1.default.debug('Begin unlock request');
        try {
            const preAuth = await this.getPreAuth();
            await this.request(canada_1.CA_ENDPOINTS.unlock, {}, { pAuth: preAuth });
            return Promise.resolve('Unlock successful');
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    /*
    airCtrl: Boolean,  // climatisation
    heating1: Boolean, // front defrost, airCtrl will be on
    defrost: Boolean,  // side mirrors & rear defrost
    airTempvalue: number | null  // temp in degrees for clim and heating 17-27
    */
    async start(startConfig) {
        logger_1.default.debug('Begin startClimate request');
        try {
            const body = {
                hvacInfo: {
                    airCtrl: (startConfig.airCtrl ?? false) || (startConfig.defrost ?? false) ? 1 : 0,
                    defrost: startConfig.defrost ?? false,
                    // postRemoteFatcStart: 1,
                    heating1: startConfig.heating1 ? 1 : 0,
                },
            };
            const airTemp = startConfig.airTempvalue;
            // TODO: can we use getTempCode here from util?
            if (airTemp != null) {
                if (airTemp > 27 || airTemp < 17) {
                    return Promise.reject('air temperature should be between 17 and 27 degrees');
                }
                let airTempValue = (6 + (airTemp - 17) * 2).toString(16).toUpperCase() + 'H';
                if (airTempValue.length == 2) {
                    airTempValue = '0' + airTempValue;
                }
                body.hvacInfo['airTemp'] = { value: airTempValue, unit: 0, hvacTempType: 1 };
            }
            else if ((startConfig.airCtrl ?? false) || (startConfig.defrost ?? false)) {
                return Promise.reject('air temperature should be specified');
            }
            const preAuth = await this.getPreAuth();
            const response = await this.request(canada_1.CA_ENDPOINTS.start, body, { pAuth: preAuth });
            return Promise.resolve(response);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    async stop() {
        logger_1.default.debug('Begin stop request');
        try {
            const preAuth = await this.getPreAuth();
            const response = await this.request(canada_1.CA_ENDPOINTS.stop, {
                pAuth: preAuth,
            });
            return Promise.resolve(response);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    // TODO: type this
    async lights(withHorn = false) {
        logger_1.default.debug('Begin lights request with horn ' + withHorn);
        try {
            const preAuth = await this.getPreAuth();
            const response = await this.request(canada_1.CA_ENDPOINTS.hornlight, { horn: withHorn }, { pAuth: preAuth });
            return Promise.resolve(response);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    // TODO: @Seb to take a look at doing this
    odometer() {
        throw new Error('Method not implemented.');
    }
    async location() {
        logger_1.default.debug('Begin locate request');
        try {
            const preAuth = await this.getPreAuth();
            const response = await this.request(canada_1.CA_ENDPOINTS.locate, {}, { pAuth: preAuth });
            this._location = response.result;
            return Promise.resolve(this._location);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    //////////////////////////////////////////////////////////////////////////////
    // Internal
    //////////////////////////////////////////////////////////////////////////////
    // Does this have to be done before every command?
    async getPreAuth() {
        logger_1.default.info('Begin pre-authentication');
        try {
            const response = await this.request(canada_1.CA_ENDPOINTS.verifyPin, {});
            return Promise.resolve(response.result.pAuth);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    // TODO: not sure how to type a dynamic response
    /* eslint-disable @typescript-eslint/no-explicit-any */
    async request(endpoint, body, headers = {}) {
        logger_1.default.debug(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);
        try {
            const response = await got_1.default(endpoint, {
                method: 'POST',
                json: true,
                headers: {
                    from: canada_1.CLIENT_ORIGIN,
                    language: 1,
                    offset: this.timeOffset,
                    accessToken: this.controller.session.accessToken,
                    vehicleId: this.vehicleConfig.id,
                    ...headers,
                },
                body: {
                    pin: this.userConfig.pin,
                    ...body,
                },
            });
            if (response.body.responseHeader.responseCode != 0) {
                return Promise.reject('bad request: ' + response.body.responseHeader.responseDesc);
            }
            return Promise.resolve(response.body);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
}
exports.default = CanadianVehicle;
//# sourceMappingURL=canadian.vehicle.js.map