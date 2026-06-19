"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const colors_1 = __importDefault(require("colors"));
const db_1 = __importDefault(require("../config/db"));
const seeder_1 = require("./seeder");
async function connectDB() {
    try {
        await db_1.default.authenticate();
        await db_1.default.sync({ alter: { drop: false } });
        // Asegurar que companion_id sea nullable (columna legada, ya no se usa)
        await db_1.default.query('ALTER TABLE visit_companions ALTER COLUMN companion_id DROP NOT NULL').catch(() => { });
        await db_1.default.query('ALTER TABLE delivery_equipment_transaction ALTER COLUMN delivery_photo_url TYPE TEXT').catch(() => { });
        await (0, seeder_1.runSeeders)();
        console.log(colors_1.default.blue("Successfully connection to the database"));
    }
    catch (error) {
        console.log(error);
        console.log(colors_1.default.bgRed.white("There was an error connecting to the database"));
    }
}
//# sourceMappingURL=dbConnection.js.map