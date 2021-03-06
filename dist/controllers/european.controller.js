"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EuropeanController = void 0;
const europe_1 = require("./../constants/europe");
const pr = __importStar(require("push-receiver"));
const got_1 = __importDefault(require("got"));
const constants_1 = require("../constants");
const european_vehicle_1 = __importDefault(require("../vehicles/european.vehicle"));
const controller_1 = require("./controller");
const logger_1 = __importDefault(require("../logger"));
const url_1 = require("url");
const tough_cookie_1 = require("tough-cookie");
const european_tools_1 = require("../tools/european.tools");
class EuropeanController extends controller_1.SessionController {
    constructor(userConfig) {
        super(userConfig);
        this.session = {
            accessToken: undefined,
            refreshToken: undefined,
            controlToken: undefined,
            deviceId: this.uuidv4(),
            tokenExpiresAt: 0,
            controlTokenExpiresAt: 0,
        };
        this.vehicles = [];
        logger_1.default.debug('EU Controller created');
        this.session.deviceId = this.uuidv4();
    }
    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    async refreshAccessToken() {
        const shouldRefreshToken = Math.floor(Date.now() / 1000 - this.session.tokenExpiresAt) >= -10;
        if (!this.session.refreshToken) {
            logger_1.default.debug('Need refresh token to refresh access token. Use login()');
            return 'Need refresh token to refresh access token. Use login()';
        }
        if (!shouldRefreshToken) {
            logger_1.default.debug('Token not expired, no need to refresh');
            return 'Token not expired, no need to refresh';
        }
        const formData = new url_1.URLSearchParams();
        formData.append('grant_type', 'refresh_token');
        formData.append('redirect_uri', 'https://www.getpostman.com/oauth2/callback'); // Oversight from Hyundai developers
        formData.append('refresh_token', this.session.refreshToken);
        const response = await got_1.default(constants_1.ALL_ENDPOINTS.EU.token, {
            method: 'POST',
            headers: {
                'Authorization': europe_1.EU_CONSTANTS.basicToken,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': europe_1.EU_API_HOST,
                'Connection': 'Keep-Alive',
                'Accept-Encoding': 'gzip',
                'User-Agent': 'okhttp/3.10.0',
            },
            body: formData.toString(),
            throwHttpErrors: false,
        });
        if (response.statusCode !== 200) {
            logger_1.default.debug(`Refresh token failed: ${response.body}`);
            return `Refresh token failed: ${response.body}`;
        }
        const responseBody = JSON.parse(response.body);
        this.session.accessToken = 'Bearer ' + responseBody.access_token;
        this.session.tokenExpiresAt = Math.floor(Date.now() / 1000 + responseBody.expires_in);
        logger_1.default.debug('Token refreshed');
        return 'Token refreshed';
    }
    async enterPin() {
        if (this.session.accessToken === '') {
            throw 'Token not set';
        }
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v1/user/pin`, {
            method: 'PUT',
            headers: {
                'Authorization': this.session.accessToken,
                'Content-Type': 'application/json',
            },
            body: {
                deviceId: this.session.deviceId,
                pin: this.userConfig.pin,
            },
            json: true,
        });
        this.session.controlToken = 'Bearer ' + response.body.controlToken;
        this.session.controlTokenExpiresAt = Math.floor(Date.now() / 1000 + response.body.expiresTime);
        return 'PIN entered OK, The pin is valid for 10 minutes';
    }
    async login() {
        try {
            // request cookie via got and store it to the cookieJar
            const cookieJar = new tough_cookie_1.CookieJar();
            await got_1.default(constants_1.ALL_ENDPOINTS.EU.session, { cookieJar });
            // required by the api to set lang
            await got_1.default(constants_1.ALL_ENDPOINTS.EU.language, { method: 'POST', body: '{"lang":"en"}', cookieJar });
            const authCodeResponse = await got_1.default(constants_1.ALL_ENDPOINTS.EU.login, {
                method: 'POST',
                json: true,
                body: {
                    'email': this.userConfig.username,
                    'password': this.userConfig.password,
                },
                cookieJar,
            });
            logger_1.default.debug(authCodeResponse.body);
            let authorizationCode;
            if (authCodeResponse) {
                const regexMatch = /code=([^&]*)/g.exec(authCodeResponse.body.redirectUrl);
                if (regexMatch !== null) {
                    authorizationCode = regexMatch[1];
                }
                else {
                    throw new Error('@EuropeControllerLogin: AuthCode was not found');
                }
            }
            const credentials = await pr.register(europe_1.EU_CONSTANTS.GCMSenderID);
            const notificationReponse = await got_1.default(`${europe_1.EU_BASE_URL}/api/v1/spa/notifications/register`, {
                method: 'POST',
                headers: {
                    'ccsp-service-id': europe_1.EU_CLIENT_ID,
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Host': europe_1.EU_API_HOST,
                    'Connection': 'Keep-Alive',
                    'Accept-Encoding': 'gzip',
                    'User-Agent': 'okhttp/3.10.0',
                    'Stamp': await european_tools_1.getStamp(),
                },
                body: {
                    pushRegId: credentials.gcm.token,
                    pushType: 'GCM',
                    uuid: this.session.deviceId,
                },
                json: true,
            });
            if (notificationReponse) {
                this.session.deviceId = notificationReponse.body.resMsg.deviceId;
            }
            const formData = new url_1.URLSearchParams();
            formData.append('grant_type', 'authorization_code');
            formData.append('redirect_uri', constants_1.ALL_ENDPOINTS.EU.redirectUri);
            formData.append('code', authorizationCode);
            const response = await got_1.default(constants_1.ALL_ENDPOINTS.EU.token, {
                method: 'POST',
                headers: {
                    'Authorization': europe_1.EU_CONSTANTS.basicToken,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Host': europe_1.EU_API_HOST,
                    'Connection': 'Keep-Alive',
                    'Accept-Encoding': 'gzip',
                    'User-Agent': 'okhttp/3.10.0',
                    'grant_type': 'authorization_code',
                    'Stamp': await european_tools_1.getStamp(),
                },
                body: formData.toString(),
                cookieJar,
            });
            if (response.statusCode !== 200) {
                throw `Get token failed: ${response.body}`;
            }
            if (response) {
                const responseBody = JSON.parse(response.body);
                this.session.accessToken = 'Bearer ' + responseBody.access_token;
                this.session.refreshToken = responseBody.refresh_token;
                this.session.tokenExpiresAt = Math.floor(Date.now() / 1000 + responseBody.expires_in);
            }
            return 'Login success';
        }
        catch (err) {
            throw err.message;
        }
    }
    async logout() {
        return 'OK';
    }
    async getVehicles() {
        if (this.session.accessToken === undefined) {
            throw 'Token not set';
        }
        const response = await got_1.default(`${europe_1.EU_BASE_URL}/api/v1/spa/vehicles`, {
            method: 'GET',
            headers: {
                'Authorization': this.session.accessToken,
                'ccsp-device-id': this.session.deviceId,
                'Stamp': await european_tools_1.getStamp(),
            },
            json: true,
        });
        this.vehicles = [];
        await this.asyncForEach(response.body.resMsg.vehicles, async (v) => {
            const vehicleProfileReponse = await got_1.default(`${europe_1.EU_BASE_URL}/api/v1/spa/vehicles/${v.vehicleId}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': this.session.accessToken,
                    'ccsp-device-id': this.session.deviceId,
                    'Stamp': await european_tools_1.getStamp(),
                },
                json: true,
            });
            const vehicleProfile = vehicleProfileReponse.body.resMsg;
            const vehicleConfig = {
                nickname: v.nickname,
                name: v.vehicleName,
                regDate: v.regDate,
                brandIndicator: 'H',
                id: v.vehicleId,
                vin: vehicleProfile.vinInfo[0].basic.vin,
                generation: vehicleProfile.vinInfo[0].basic.modelYear,
            };
            this.vehicles.push(new european_vehicle_1.default(vehicleConfig, this));
            logger_1.default.debug(`Added vehicle ${vehicleConfig.id}`);
        });
        return this.vehicles;
    }
    // TODO: type this or replace it with a normal loop
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }
}
exports.EuropeanController = EuropeanController;
//# sourceMappingURL=european.controller.js.map