"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("../../middleware");
const agent_1 = require("../../handlers/VisitsModule/agent");
const jwt_1 = require("../../middleware/jwt");
const router = (0, express_1.Router)();
router.post("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('agents:create'), (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"), middleware_1.handleInputErrors, agent_1.createAgent);
router.get("/", jwt_1.validateJWT, (0, jwt_1.checkPermission)('agents:view'), agent_1.getAgents);
router.get("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('agents:view'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, agent_1.getAgentById);
router.patch("/:id", jwt_1.validateJWT, (0, jwt_1.checkPermission)('agents:edit'), (0, express_validator_1.param)("id").isInt().withMessage("Id no válido"), middleware_1.handleInputErrors, agent_1.updateAgent);
exports.default = router;
//# sourceMappingURL=agent.routes.js.map