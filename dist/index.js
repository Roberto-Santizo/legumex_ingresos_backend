"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const dbConnection_1 = require("./database/dbConnection");
const visit_1 = require("./handlers/VisitsModule/visit");
const colors_1 = __importDefault(require("colors"));
const port = process.env.PORT || 4000;
// Cada minuto: finaliza automáticamente las visitas con salida temporal cuyo plazo de regreso venció
const TEMP_EXIT_CHECK_INTERVAL_MS = 60 * 1000;
async function main() {
    await (0, dbConnection_1.connectDB)();
    server_1.default.listen(port, () => {
        console.log(colors_1.default.cyan.bold(`Rest API on the port ${port}`));
    });
    setInterval(() => { (0, visit_1.closeExpiredTempExits)(); }, TEMP_EXIT_CHECK_INTERVAL_MS);
}
main();
//# sourceMappingURL=index.js.map