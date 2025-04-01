"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
exports.default = {
    authSecret: '4mFr5Pv2G-;:D{A#',
    tokenExpireIn: process.env.NODE_ENV == 'development' ? '24h' : '30m',
    refreshTokenExpireIn: process.env.NODE_ENV == 'development' ? '750h' : '24h'
};
