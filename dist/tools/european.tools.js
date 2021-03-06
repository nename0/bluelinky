"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStamp = void 0;
const european_hyundai_token_collection_1 = __importDefault(require("./european.hyundai.token.collection"));
exports.getStamp = () => {
    return european_hyundai_token_collection_1.default[Math.floor(Math.random() * european_hyundai_token_collection_1.default.length)];
};
//# sourceMappingURL=european.tools.js.map