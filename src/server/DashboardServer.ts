import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

export class DashboardServer {
    private app: express.Application;
    private server: http.Server;
    private io: Server;
    private port: number = 3001;

    constructor() {
        this.app = express();
        this.app.use(cors());
        this.app.use(express.json());

        const { WalletAnalyzer } = require('../tracker/WalletAnalyzer');
        const analyzer = new WalletAnalyzer();

        this.app.get('/api/wallet/:address', async (req, res) => {
            try {
                const data = await analyzer.analyzeWallet(req.params.address);
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: 'Failed to analyze wallet' });
            }
        });
        
        this.server = http.createServer(this.app);
        
        this.io = new Server(this.server, {
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

    public start() {
        this.server.listen(this.port, () => {
            console.log(`[DASHBOARD] Server running on http://localhost:${this.port}`);
        });
    }

    public broadcastWhale(whaleData: any) {
        this.io.emit('whale_discovered', whaleData);
    }
}
