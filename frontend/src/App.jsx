import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Activity, Anchor, Clock, DollarSign, Wallet, Search, X, ActivitySquare, History } from 'lucide-react';
import './index.css';

const socket = io('http://localhost:3001');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [whales, setWhales] = useState([]);
  const [totalValueUsd, setTotalValueUsd] = useState(0);

  // Wallet Details Modal State
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('whale_discovered', (data) => {
      setWhales((prev) => [data, ...prev].slice(0, 50)); // Keep last 50
      setTotalValueUsd((prev) => prev + parseFloat(data.usdValue));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('whale_discovered');
    };
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  const analyzeWallet = async (address) => {
    setSelectedWallet(address);
    setIsAnalyzing(true);
    try {
      const response = await fetch(`http://localhost:3001/api/wallet/${address}`);
      const data = await response.json();
      setWalletData(data);
    } catch (error) {
      console.error("Failed to analyze wallet", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const closeModal = () => {
    setSelectedWallet(null);
    setWalletData(null);
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="title-container">
          <Anchor color="#f59e0b" size={32} />
          <h1 className="title">Whale Discovery Agent</h1>
        </div>
        <div className="status-badge">
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          {isConnected ? 'Scanning Network' : 'Disconnected'}
        </div>
      </header>

      <main>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Whales Found</div>
            <div className="stat-value">{whales.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Volume Tracked (USD)</div>
            <div className="stat-value">{formatCurrency(totalValueUsd)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Status</div>
            <div className="stat-value" style={{ color: isConnected ? '#10b981' : '#ef4444' }}>
              {isConnected ? 'Active (Mempool)' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="feed-container">
          <div className="feed-header">
            <Activity size={20} className="pulse" />
            Live Whale Feed
          </div>
          
          {whales.length === 0 ? (
            <div className="empty-state">
              <Clock size={48} opacity={0.5} />
              <p>Waiting for large transactions to appear in the Mempool...</p>
            </div>
          ) : (
            <div className="feed-list">
              {whales.map((whale, index) => (
                <div key={`${whale.hash}-${index}`} className="whale-item">
                  <div className="whale-icon">
                    <Wallet size={24} />
                  </div>
                  <div className="whale-info">
                    <div className="wallet-address">{whale.wallet}</div>
                    <div className="tx-time">Discovered at {formatTime(whale.timestamp)}</div>
                  </div>
                  <div className={`badge ${whale.type}`}>
                    {whale.type === 'mempool' ? 'Pending' : 'Confirmed'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="tx-value-eth">{whale.ethValue} ETH</div>
                    <div className="tx-value-usd">≈ {formatCurrency(parseFloat(whale.usdValue))}</div>
                  </div>
                  <button className="analyze-btn" onClick={() => analyzeWallet(whale.wallet)}>
                    <Search size={16} /> Analyze
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Wallet Details Modal */}
      {selectedWallet && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}><X size={24} /></button>
            
            <h2 className="modal-title">Wallet Deep Dive</h2>
            <div className="modal-wallet-address">{selectedWallet}</div>

            {isAnalyzing ? (
              <div className="loading-state">
                <ActivitySquare className="pulse" size={48} color="#f59e0b" />
                <p>Analyzing blockchain history and open positions...</p>
              </div>
            ) : walletData ? (
              <div className="modal-body">
                
                <div className="modal-section">
                  <h3>Wallet Balance</h3>
                  <div className="balance-display">{parseFloat(walletData.balanceEth).toFixed(4)} ETH</div>
                </div>

                <div className="modal-section">
                  <h3>Detected Positions (Long/Short/Borrow)</h3>
                  {walletData.positions && walletData.positions.length > 0 ? (
                    <div className="positions-list">
                      {walletData.positions.map((pos, idx) => (
                        <div key={idx} className="position-card">
                          <div className="pos-header">
                            <span className="pos-protocol">{pos.protocol}</span>
                            <span className="pos-type">{pos.type}</span>
                          </div>
                          <div className="pos-details">
                            <p>Status: <strong>{pos.status}</strong></p>
                            <p>Health Factor: <strong style={{color: '#10b981'}}>{pos.healthFactor}</strong></p>
                            <p>Liquidation Risk: <strong>{pos.liquidationRisk}</strong></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No active margin or lending positions detected on major protocols.</p>
                  )}
                </div>

                <div className="modal-section">
                  <h3>Recent Asset Transfers</h3>
                  <div className="history-list">
                    {walletData.recentTransfers && walletData.recentTransfers.map((tx, idx) => (
                      <div key={idx} className="history-item">
                        <History size={16} color="#94a3b8" />
                        <span className="history-val">{tx.value || '?'} {tx.asset || 'Token'}</span>
                        <span className="history-cat">({tx.category})</span>
                        <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="history-link">View Tx</a>
                      </div>
                    ))}
                    {walletData.recentTransfers?.length === 0 && <p className="no-data">No recent transfers found.</p>}
                  </div>
                </div>

              </div>
            ) : (
              <div className="loading-state">
                <p>Failed to fetch wallet data.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
