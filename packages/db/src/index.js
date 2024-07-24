"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupChats = exports.messages = exports.db = exports.users = void 0;
var schema_1 = require("./schema");
Object.defineProperty(exports, "users", { enumerable: true, get: function () { return schema_1.users; } });
Object.defineProperty(exports, "messages", { enumerable: true, get: function () { return schema_1.messages; } });
Object.defineProperty(exports, "groupChats", { enumerable: true, get: function () { return schema_1.groupChats; } });
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
if (!process.env.DATABASE_URL_LOCAL) {
    throw new Error('DATABASE_URL_LOCAL must be set');
}
var queryClient = (0, postgres_1.default)(process.env.DATABASE_URL_LOCAL);
var db = (0, postgres_js_1.drizzle)(queryClient);
exports.db = db;
