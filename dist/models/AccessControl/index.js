"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermission = exports.Permission = exports.Role = exports.User = void 0;
var User_model_1 = require("./User.model");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return __importDefault(User_model_1).default; } });
var Role_model_1 = require("./Role.model");
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return __importDefault(Role_model_1).default; } });
var Permission_model_1 = require("./Permission.model");
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return __importDefault(Permission_model_1).default; } });
var RolePermission_model_1 = require("./RolePermission.model");
Object.defineProperty(exports, "RolePermission", { enumerable: true, get: function () { return __importDefault(RolePermission_model_1).default; } });
//# sourceMappingURL=index.js.map