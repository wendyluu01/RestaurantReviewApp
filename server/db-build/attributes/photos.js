"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributes = void 0;
const models_1 = __importDefault(require("../models"));
const Seq = models_1.default.Sequelize;
const attributes = {
    id: [[Seq.literal('"photos"."id"'), 'id']],
    default: [
        'id',
        'uuid',
        'review_id',
        'user_id',
        'business_id',
        'caption',
        'label',
    ],
};
exports.attributes = attributes;
