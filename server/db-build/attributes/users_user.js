"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributes = void 0;
const models_1 = __importDefault(require("../models"));
const Seq = models_1.default.Sequelize;
const attributes = {
    id: [[Seq.literal('DISTINCT ON ("users_user"."id") "users_user"."id"'), 'id']],
    uuid: [[Seq.literal('"users_user"."uuid"'), 'uuid']],
    first_name: [[Seq.literal('"users_user"."first_name"'), 'first_name']],
    last_name: [[Seq.literal('"users_user"."last_name"'), 'last_name']],
    email: [[Seq.literal('"users_user"."email"'), 'email']],
    phone: [[Seq.literal('"users_user"."phone"'), 'phone']]
};
exports.attributes = attributes;
