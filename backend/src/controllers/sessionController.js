"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endSession = exports.getActiveSessions = exports.joinSession = exports.createSession = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, defaultLang, isPublic } = req.body;
        const hostId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!hostId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const session = yield prisma.session.create({
            data: {
                title,
                description,
                defaultLang,
                isPublic,
                hostId,
                status: 'ACTIVE'
            },
            include: {
                host: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.status(201).json(session);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating session' });
    }
});
exports.createSession = createSession;
const joinSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { sessionId, language } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // Check if session exists and is active
        const session = yield prisma.session.findUnique({
            where: { id: sessionId }
        });
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        if (session.status !== 'ACTIVE') {
            res.status(400).json({ error: 'Session is not active' });
            return;
        }
        // Join session
        const participant = yield prisma.sessionParticipant.create({
            data: {
                sessionId,
                userId,
                language
            },
            include: {
                session: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.status(201).json(participant);
    }
    catch (error) {
        res.status(500).json({ error: 'Error joining session' });
    }
});
exports.joinSession = joinSession;
const getActiveSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const sessions = yield prisma.session.findMany({
            where: {
                OR: [
                    { isPublic: true },
                    { hostId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }
                ],
                status: 'ACTIVE'
            },
            include: {
                host: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        res.json(sessions);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching sessions' });
    }
});
exports.getActiveSessions = getActiveSessions;
const endSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { sessionId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const session = yield prisma.session.findUnique({
            where: { id: sessionId }
        });
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        if (session.hostId !== userId) {
            res.status(403).json({ error: 'Only the host can end the session' });
            return;
        }
        const updatedSession = yield prisma.session.update({
            where: { id: sessionId },
            data: {
                status: 'ENDED',
                endedAt: new Date()
            }
        });
        res.json(updatedSession);
    }
    catch (error) {
        res.status(500).json({ error: 'Error ending session' });
    }
});
exports.endSession = endSession;
