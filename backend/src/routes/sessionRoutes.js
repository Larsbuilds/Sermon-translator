"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionController_1 = require("../controllers/sessionController");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.auth);
// Create session (HOST only)
router.post('/', [
    auth_1.requireHost,
    (0, express_validator_1.body)('title').notEmpty(),
    (0, express_validator_1.body)('defaultLang').isIn(['EN', 'UK', 'DE']),
    (0, express_validator_1.body)('isPublic').isBoolean()
], sessionController_1.createSession);
// Join session
router.post('/join', [
    (0, express_validator_1.body)('sessionId').notEmpty(),
    (0, express_validator_1.body)('language').isIn(['EN', 'UK', 'DE'])
], sessionController_1.joinSession);
// Get active sessions
router.get('/active', sessionController_1.getActiveSessions);
// End session (HOST only)
router.post('/:sessionId/end', auth_1.requireHost, sessionController_1.endSession);
exports.default = router;
