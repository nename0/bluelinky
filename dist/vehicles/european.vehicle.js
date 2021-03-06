"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const common_interfaces_1 = require("../interfaces/common.interfaces");
const got_1 = __importDefault(require("got"));
const logger_1 = __importDefault(require("../logger"));
const vehicle_1 = require("./vehicle");
const util_1 = require("../util");
const europe_1 = require("../constants/europe");
const european_tools_1 = require("../tools/european.tools");
class EuropeanVehicle extends vehicle_1.Vehicle {
    constructor(vehicleConfig, controller) {
        super(vehicleConfig, controller);
        this.vehicleConfig = vehicleConfig;
        this.controller = controller;
        this.region = constants_1.REGIONS.EU;
        logger_1.default.debug(`EU Vehicle ${this.vehicleConfig.id} created`);
    }
    async checkControlToken() {
        await this.controller.refreshAccessToken();
        if (this.controller.session?.controlTokenExpiresAt !== undefined) {
            if (!this.controller.session.controlToken ||
                Date.now() / 1000 > this.controller.session.controlTokenExpiresAt) {
                await this.controller.enterPin();
            }
        }
    }
    async start(config) {
        await this.checkControlToken();
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/temperature`, {
            method: 'POST',
            body: {
                action: 'start',
                hvacType: 0,
                options: {
                    defrost: config.defrost,
                    heating1: config.windscreenHeating ? 1 : 0,
                },
                tempCode: util_1.celciusToTempCode(config.temperature),
                unit: config.unit,
            },
            headers: {
                'Authorization': this.controller.session.controlToken,
                'ccsp-device-id': this.controller.session.deviceId,
                'Content-Type': 'application/json',
                'Stamp': await european_tools_1.getStamp(),
            },
            json: true,
        });
        logger_1.default.info(`Climate started for vehicle ${this.vehicleConfig.id}`);
        return response.body;
    }
    async stop() {
        await this.checkControlToken();
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/temperature`, {
            method: 'POST',
            body: {
                action: 'stop',
                hvacType: 0,
                options: {
                    defrost: true,
                    heating1: 1,
                },
                tempCode: '10H',
                unit: 'C',
            },
            headers: {
                'Authorization': this.controller.session.controlToken,
                'ccsp-device-id': this.controller.session.deviceId,
                'Content-Type': 'application/json',
                'Stamp': await european_tools_1.getStamp(),
            },
            json: true,
        });
        logger_1.default.info(`Climate stopped for vehicle ${this.vehicleConfig.id}`);
        return response.body;
    }
    async lock() {
        await this.checkControlToken();
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/door`, {
            method: 'POST',
            headers: {
                'Authorization': this.controller.session.controlToken,
                'ccsp-device-id': this.controller.session.deviceId,
                'Content-Type': 'application/json',
                'Stamp': await european_tools_1.getStamp(),
            },
            body: {
                action: 'close',
                deviceId: this.controller.session.deviceId,
            },
            json: true,
        });
        if (response.statusCode === 200) {
            logger_1.default.debug(`Vehicle ${this.vehicleConfig.id} locked`);
            return 'Lock successful';
        }
        return 'Something went wrong!';
    }
    async unlock() {
        await this.checkControlToken();
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/door`, {
            method: 'POST',
            headers: {
                'Authorization': this.controller.session.controlToken,
                'ccsp-device-id': this.controller.session.deviceId,
                'Content-Type': 'application/json',
                'Stamp': await european_tools_1.getStamp(),
            },
            body: {
                action: 'open',
                deviceId: this.controller.session.deviceId,
            },
            json: true,
        });
        if (response.statusCode === 200) {
            logger_1.default.debug(`Vehicle ${this.vehicleConfig.id} unlocked`);
            return 'Unlock successful';
        }
        return 'Something went wrong!';
    }
    async fullStatus(input) {
        const statusConfig = {
            ...constants_1.DEFAULT_VEHICLE_STATUS_OPTIONS,
            ...input,
        };
        await this.checkControlToken();
        const cachedResponse = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status/latest`, {
            method: 'GET',
            headers: {
                'Authorization': this.controller.session.controlToken,
                'ccsp-device-id': this.controller.session.deviceId,
                'Content-Type': 'application/json',
                'Stamp': await european_tools_1.getStamp(),
            },
            json: true,
        });
        const fullStatus = cachedResponse.body.resMsg.vehicleStatusInfo;
        if (statusConfig.refresh) {
            const statusResponse = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status`, {
                method: 'GET',
                headers: {
                    'Authorization': this.controller.session.controlToken,
                    'ccsp-device-id': this.controller.session.deviceId,
                    'Content-Type': 'application/json',
                    'Stamp': await european_tools_1.getStamp(),
                },
                json: true,
            });
            fullStatus.vehicleStatus = statusResponse.body.resMsg;
            const locationResponse = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/location`, {
                method: 'GET',
                headers: {
                    'Authorization': this.controller.session.controlToken,
                    'ccsp-device-id': this.controller.session.deviceId,
                    'Content-Type': 'application/json',
                    'Stamp': await european_tools_1.getStamp(),
                },
                json: true,
            });
            fullStatus.vehicleLocation = locationResponse.body.resMsg.gpsDetail;
        }
        this._fullStatus = fullStatus;
        return Promise.resolve(this._fullStatus);
    }
    async status(input) {
        const statusConfig = {
            ...constants_1.DEFAULT_VEHICLE_STATUS_OPTIONS,
            ...input,
        };
        await this.checkControlToken();
        const cacheString = statusConfig.refresh ? '' : '/latest';
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status${cacheString}`, {
            method: 'GET',
            headers: {
                'Authorization': this.controller.session.controlToken,
                'ccsp-device-id': this.controller.session.deviceId,
                'Content-Type': 'application/json',
                'Stamp': await european_tools_1.getStamp(),
            },
            json: true,
        });
        // handles refreshing data
        const vehicleStatus = statusConfig.refresh
            ? response.body.resMsg
            : response.body.resMsg.vehicleStatusInfo.vehicleStatus;
        const parsedStatus = {
            chassis: {
                hoodOpen: vehicleStatus?.hoodOpen,
                trunkOpen: vehicleStatus?.trunkOpen,
                locked: vehicleStatus.doorLock,
                openDoors: {
                    frontRight: !!vehicleStatus?.doorOpen?.frontRight,
                    frontLeft: !!vehicleStatus?.doorOpen?.frontLeft,
                    backLeft: !!vehicleStatus?.doorOpen?.backLeft,
                    backRight: !!vehicleStatus?.doorOpen?.backRight,
                },
                tirePressureWarningLamp: {
                    rearLeft: !!vehicleStatus?.tirePressureLamp?.tirePressureLampRL,
                    frontLeft: !!vehicleStatus?.tirePressureLamp?.tirePressureLampFL,
                    frontRight: !!vehicleStatus?.tirePressureLamp?.tirePressureLampFR,
                    rearRight: !!vehicleStatus?.tirePressureLamp?.tirePressureLampRR,
                    all: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampAll,
                },
            },
            climate: {
                active: vehicleStatus?.airCtrlOn,
                steeringwheelHeat: !!vehicleStatus?.steerWheelHeat,
                sideMirrorHeat: false,
                rearWindowHeat: !!vehicleStatus?.sideBackWindowHeat,
                defrost: vehicleStatus?.defrost,
                temperatureSetpoint: util_1.tempCodeToCelsius(vehicleStatus?.airTemp?.value),
                temperatureUnit: vehicleStatus?.airTemp?.unit,
            },
            engine: {
                ignition: vehicleStatus.engine,
                adaptiveCruiseControl: vehicleStatus?.acc,
                rangeGas: vehicleStatus?.evStatus?.drvDistance[0]?.rangeByFuel?.gasModeRange?.value ?? vehicleStatus?.dte?.value,
                // EV
                range: vehicleStatus?.evStatus?.drvDistance[0]?.rangeByFuel?.totalAvailableRange?.value,
                rangeEV: vehicleStatus?.evStatus?.drvDistance[0]?.rangeByFuel?.evModeRange?.value,
                plugedTo: vehicleStatus?.evStatus?.batteryPlugin ?? common_interfaces_1.EVPlugTypes.UNPLUGED,
                charging: vehicleStatus?.evStatus?.batteryCharge,
                estimatedCurrentChargeDuration: vehicleStatus?.evStatus?.remainTime2?.atc?.value,
                estimatedFastChargeDuration: vehicleStatus?.evStatus?.remainTime2?.etc1?.value,
                estimatedPortableChargeDuration: vehicleStatus?.evStatus?.remainTime2?.etc2?.value,
                estimatedStationChargeDuration: vehicleStatus?.evStatus?.remainTime2?.etc3?.value,
                batteryCharge12v: vehicleStatus?.battery?.batSoc,
                batteryChargeHV: vehicleStatus?.evStatus?.batteryStatus,
            },
        };
        if (!parsedStatus.engine.range) {
            if (parsedStatus.engine.rangeEV || parsedStatus.engine.rangeGas) {
                parsedStatus.engine.range = (parsedStatus.engine.rangeEV ?? 0) + (parsedStatus.engine.rangeGas ?? 0);
            }
        }
        this._status = statusConfig.parsed ? parsedStatus : vehicleStatus;
        return this._status;
    }
    async odometer() {
        await this.checkControlToken();
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status/latest`, {
            method: 'GET',
            headers: {
                'Authorization': this.controller.session.controlToken,
                'ccsp-device-id': this.controller.session.deviceId,
                'Content-Type': 'application/json',
                'Stamp': await european_tools_1.getStamp(),
            },
            json: true,
        });
        this._odometer = response.body.resMsg.vehicleStatusInfo.odometer;
        return this._odometer;
    }
    async location() {
        await this.checkControlToken();
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/location`, {
            method: 'GET',
            headers: {
                'Authorization': this.controller.session.controlToken,
                'ccsp-device-id': this.controller.session.deviceId,
                'Content-Type': 'application/json',
                'Stamp': await european_tools_1.getStamp(),
            },
            json: true,
        });
        const data = response.body.resMsg.gpsDetail;
        this._location = {
            latitude: data.coord.lat,
            longitude: data.coord.lon,
            altitude: data.coord.alt,
            speed: {
                unit: data.speed.unit,
                value: data.speed.value,
            },
            heading: data.head,
        };
        return this._location;
    }
    async startCharge() {
        await this.checkControlToken();
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`, {
            method: 'POST',
            headers: {
                'Authorization': this.controller.session.controlToken,
                'ccsp-device-id': this.controller.session.deviceId,
                'Content-Type': 'application/json',
                'Stamp': await european_tools_1.getStamp(),
            },
            body: {
                action: 'start',
                deviceId: this.controller.session.deviceId,
            },
            json: true,
        });
        if (response.statusCode === 200) {
            logger_1.default.debug(`Send start charge command to Vehicle ${this.vehicleConfig.id}`);
            return 'Start charge successful';
        }
        throw 'Something went wrong!';
    }
    async stopCharge() {
        await this.checkControlToken();
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`, {
            method: 'POST',
            headers: {
                'Authorization': this.controller.session.controlToken,
                'ccsp-device-id': this.controller.session.deviceId,
                'Content-Type': 'application/json',
                'Stamp': await european_tools_1.getStamp(),
            },
            body: {
                action: 'stop',
                deviceId: this.controller.session.deviceId,
            },
            json: true,
        });
        if (response.statusCode === 200) {
            logger_1.default.debug(`Send stop charge command to Vehicle ${this.vehicleConfig.id}`);
            return 'Stop charge successful';
        }
        throw 'Something went wrong!';
    }
}
exports.default = EuropeanVehicle;
//# sourceMappingURL=european.vehicle.js.map