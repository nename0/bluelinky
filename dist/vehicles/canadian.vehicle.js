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
const util_1 = require("../util");
class CanadianVehicle extends vehicle_1.Vehicle {
    constructor(vehicleConfig, controller) {
        super(vehicleConfig, controller);
        this.vehicleConfig = vehicleConfig;
        this.controller = controller;
        this.region = constants_1.REGIONS.CA;
        this.timeOffset = -(new Date().getTimezoneOffset() / 60);
        logger_1.default.debug(`CA Vehicle ${this.vehicleConfig.id} created`);
    }
    fullStatus() {
        throw new Error('Method not implemented.');
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
            logger_1.default.debug(vehicleStatus);
            const parsedStatus = {
                chassis: {
                    hoodOpen: vehicleStatus?.hoodOpen,
                    trunkOpen: vehicleStatus?.trunkOpen,
                    locked: vehicleStatus?.doorLock,
                    openDoors: {
                        frontRight: !!vehicleStatus?.doorOpen?.frontRight,
                        frontLeft: !!vehicleStatus?.doorOpen?.frontLeft,
                        backLeft: !!vehicleStatus?.doorOpen?.backLeft,
                        backRight: !!vehicleStatus?.doorOpen?.backRight,
                    },
                    tirePressureWarningLamp: {
                        rearLeft: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampRearLeft,
                        frontLeft: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampFrontLeft,
                        frontRight: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampFrontRight,
                        rearRight: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampRearRight,
                        all: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampAll,
                    },
                },
                climate: {
                    active: vehicleStatus?.airCtrlOn,
                    steeringwheelHeat: !!vehicleStatus?.steerWheelHeat,
                    sideMirrorHeat: false,
                    rearWindowHeat: !!vehicleStatus?.sideBackWindowHeat,
                    defrost: vehicleStatus?.defrost,
                    temperatureSetpoint: vehicleStatus?.airTemp?.value,
                    temperatureUnit: vehicleStatus?.airTemp?.unit,
                },
                // TODO: fix props for parsed???
                // Seems some of the translation would have to account for EV and ICE
                // as they are often in different locations on the response
                // example EV status is in lib/__mock__/canadianStatus.json
                engine: {
                    ignition: vehicleStatus?.engine,
                    adaptiveCruiseControl: vehicleStatus?.acc,
                    range: vehicleStatus?.dte?.value,
                    charging: vehicleStatus?.evStatus?.batteryCharge,
                    batteryCharge12v: vehicleStatus?.battery?.batSoc,
                    batteryChargeHV: vehicleStatus?.evStatus?.batteryStatus,
                },
            };
            this._status = statusConfig.parsed ? parsedStatus : vehicleStatus;
            return this._status;
        }
        catch (err) {
            throw err.message;
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
            return 'Lock successful';
        }
        catch (err) {
            throw err.message;
        }
    }
    async unlock() {
        logger_1.default.debug('Begin unlock request');
        try {
            const preAuth = await this.getPreAuth();
            await this.request(canada_1.CA_ENDPOINTS.unlock, {}, { pAuth: preAuth });
            return 'Unlock successful';
        }
        catch (err) {
            throw err.message;
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
                body.hvacInfo['airTemp'] = { value: util_1.celciusToTempCode(airTemp), unit: 0, hvacTempType: 1 };
            }
            else if ((startConfig.airCtrl ?? false) || (startConfig.defrost ?? false)) {
                throw 'air temperature should be specified';
            }
            const preAuth = await this.getPreAuth();
            const response = await this.request(canada_1.CA_ENDPOINTS.start, body, { pAuth: preAuth });
            logger_1.default.debug(response);
            if (response.statusCode === 200) {
                return 'Vehicle started!';
            }
            return 'Failed to start vehicle';
        }
        catch (err) {
            throw err.message;
        }
    }
    async stop() {
        logger_1.default.debug('Begin stop request');
        try {
            const preAuth = await this.getPreAuth();
            const response = await this.request(canada_1.CA_ENDPOINTS.stop, {
                pAuth: preAuth,
            });
            return response;
        }
        catch (err) {
            throw 'error: ' + err;
        }
    }
    // TODO: type this
    async lights(withHorn = false) {
        logger_1.default.debug('Begin lights request with horn ' + withHorn);
        try {
            const preAuth = await this.getPreAuth();
            const response = await this.request(canada_1.CA_ENDPOINTS.hornlight, { horn: withHorn }, { pAuth: preAuth });
            return response;
        }
        catch (err) {
            throw 'error: ' + err;
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
            return this._location;
        }
        catch (err) {
            throw 'error: ' + err;
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
            return response.result.pAuth;
        }
        catch (err) {
            throw 'error: ' + err;
        }
    }
    // TODO: not sure how to type a dynamic response
    /* eslint-disable @typescript-eslint/no-explicit-any */
    async request(endpoint, body, headers = {}) {
        logger_1.default.debug(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);
        // add logic for token refresh to ensure we don't use a stale token
        await this.controller.refreshAccessToken();
        const options = {
            method: 'POST',
            json: true,
            throwHttpErrors: false,
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
        };
        try {
            const response = await got_1.default(endpoint, options);
            if (response.body.responseHeader.responseCode != 0) {
                return response.body.responseHeader.responseDesc;
            }
            return response.body;
        }
        catch (err) {
            throw 'error: ' + err;
        }
    }
}
exports.default = CanadianVehicle;
//# sourceMappingURL=canadian.vehicle.js.map