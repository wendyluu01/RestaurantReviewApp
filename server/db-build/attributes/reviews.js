"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributes = void 0;
const models_1 = __importDefault(require("../models"));
const Seq = models_1.default.Sequelize;
const attributes = {
    id: [[Seq.literal('DISTINCT ON ("reviews"."id") "reviews"."id"'), 'id']],
    default: [
        'id',
        'uuid',
        'stars',
        'text',
        'useful',
        'funny',
        'cool'
    ]
};
exports.attributes = attributes;
