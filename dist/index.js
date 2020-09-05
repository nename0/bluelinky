"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const american_controller_1 = require("./controllers/american.controller");
const european_controller_1 = require("./controllers/european.controller");
const canadian_controller_1 = require("./controllers/canadian.controller");
const events_1 = require("events");
const logger_1 = __importDefault(require("./logger"));
const constants_1 = require("./constants");
class BlueLinky extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.vehicles = [];
        this.config = {
            username: '',
            password: '',
            region: constants_1.REGIONS.US,
            autoLogin: true,
            pin: '1234',
            vin: '',
            vehicleId: undefined,
        };
        switch (config.region) {
            case constants_1.REGIONS.EU:
                this.controller = new european_controller_1.EuropeanController(config);
                break;
            case constants_1.REGIONS.US:
                this.controller = new american_controller_1.AmericanController(config);
                break;
            case constants_1.REGIONS.CA:
                this.controller = new canadian_controller_1.CanadianController(config);
                break;
            default:
                throw new Error('Your region is not supported yet.');
        }
        // merge configs
        this.config = {
            ...this.config,
            ...config,
        };
        if (config.autoLogin === undefined) {
            this.config.autoLogin = true;
        }
        this.onInit();
    }
    onInit() {
        if (this.config.autoLogin) {
            logger_1.default.debug('Bluelinky is logging in automatically, to disable use autoLogin: false');
            this.login();
        }
    }
    async login() {
        logger_1.default.debug('loggin into to API');
        try {
            const response = await this.controller.login();
            // get all cars from the controller
            this.vehicles = await this.controller.getVehicles();
            logger_1.default.debug(`Found ${this.vehicles.length} on the account`);
            this.emit('ready', this.vehicles);
            return response;
        }
        catch (error) {
            this.emit('error', error);
            return error;
        }
    }
    async getVehicles() {
        return this.controller.getVehicles() || [];
    }
    getVehicle(input) {
        try {
            const foundCar = this.vehicles.find(car => {
                return car.vin() === input || car.id() === input;
            });
            if (!foundCar && this.vehicles.length > 0) {
                throw new Error(`Could not find vehicle with id: ${input}`);
            }
            return foundCar;
        }
        catch (err) {
            throw new Error(`Vehicle not found: ${input}!`);
        }
    }
    async refreshAccessToken() {
        return this.controller.refreshAccessToken();
    }
    async logout() {
        return this.controller.logout();
    }
    getSession() {
        return this.controller.session;
    }
}
exports.default = BlueLinky;
//# sourceMappingURL=index.js.map