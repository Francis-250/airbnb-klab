"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = require("../controllers/stats.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/users", stats_controller_1.getUserStats);
router.get("/dashboard", auth_middleware_1.verifyToken, auth_middleware_1.isHost, stats_controller_1.getDashboardStats);
exports.default = router;
