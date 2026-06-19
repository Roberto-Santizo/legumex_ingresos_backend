"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const dbConnection_1 = require("./database/dbConnection");
const colors_1 = __importDefault(require("colors"));
const port = process.env.PORT || 4000;
async function main() {
    await (0, dbConnection_1.connectDB)();
    server_1.default.listen(port, () => {
        console.log(colors_1.default.cyan.bold(`Rest API on the port ${port}`));
    });
}
main();
//# sourceMappingURL=index.js.map