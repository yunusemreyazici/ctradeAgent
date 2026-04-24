"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardServer = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
class DashboardServer {
    app;
    server;
    io;
    port = 3001;
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        const { WalletAnalyzer } = require('../tracker/WalletAnalyzer');
        const analyzer = new WalletAnalyzer();
        this.app.get('/api/wallet/:address', async (req, res) => {
            try {
                const data = await analyzer.analyzeWallet(req.params.address);
                res.json(data);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to analyze wallet' });
            }
        });
        this.server = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.io.on('connection', (socket) => {
            console.log(`[DASHBOARD] Client connected: ${socket.id}`);
            socket.on('disconnect', () => {
                console.log(`[DASHBOARD] Client disconnected: ${socket.id}`);
            });
        });
    }
    start() {
        this.server.listen(this.port, () => {
            console.log(`[DASHBOARD] Server running on http://localhost:${this.port}`);
        });
    }
    broadcastWhale(whaleData) {
        this.io.emit('whale_discovered', whaleData);
    }
}
exports.DashboardServer = DashboardServer;
