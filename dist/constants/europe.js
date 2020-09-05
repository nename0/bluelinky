"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EU_CLIENT_ID = exports.EU_CONSTANTS = exports.EU_ENDPOINTS = exports.EU_BASE_URL = exports.EU_API_HOST = void 0;
exports.EU_API_HOST = 'prd.eu-ccapi.hyundai.com:8080';
exports.EU_BASE_URL = `https://${exports.EU_API_HOST}`;
exports.EU_ENDPOINTS = {
    session: `${exports.EU_BASE_URL}/api/v1/user/oauth2/authorize?response_type=code&state=test&client_id=6d477c38-3ca4-4cf3-9557-2a1929a94654&redirect_uri=${exports.EU_BASE_URL}/api/v1/user/oauth2/redirect`,
    login: `${exports.EU_BASE_URL}/api/v1/user/signin`,
    language: `${exports.EU_BASE_URL}/api/v1/user/language`,
    redirectUri: `${exports.EU_BASE_URL}/api/v1/user/oauth2/redirect`,
    token: `${exports.EU_BASE_URL}/api/v1/user/oauth2/token`,
};
exports.EU_CONSTANTS = {
    basicToken: 'Basic NmQ0NzdjMzgtM2NhNC00Y2YzLTk1NTctMmExOTI5YTk0NjU0OktVeTQ5WHhQekxwTHVvSzB4aEJDNzdXNlZYaG10UVI5aVFobUlGampvWTRJcHhzVg==',
    GCMSenderID: '199360397125',
};
exports.EU_CLIENT_ID = '6d477c38-3ca4-4cf3-9557-2a1929a94654';
//# sourceMappingURL=europe.js.map