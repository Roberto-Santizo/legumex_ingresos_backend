"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const appRoutes_1 = __importDefault(require("./routes/appRoutes"));
const server = (0, express_1.default)();
server.set("trust proxy", 1);
server.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173"
}));
server.use(express_1.default.json({ limit: '100mb' }));
server.use("/api", appRoutes_1.default);
server.get("/", (req, res) => {
    res.json({ message: "From Api" });
});
exports.default = server;
//# sourceMappingURL=server.js.map