import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import AuditPage from './pages/AuditPage';
import ToolPacksPage from './pages/ToolPacksPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import IntegrationsPage from './pages/IntegrationsPage';
import MyStuffPage from './pages/MyStuffPage';
import { authAPI } from './services/api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('samarthya_token');
        if (token) {
            try {
                const res = await authAPI.getProfile();
                setUser(res.data.user);
            } catch (err) {
                localStorage.removeItem('samarthya_token');
            }
        }
        setLoading(false);
    };

    const handleLogin = (userData, token) => {
        localStorage.setItem('samarthya_token', token);
        setUser(userData);
        setShowLogin(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('samarthya_token');
        setUser(null);
        setShowLogin(false);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-primary)',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '3px solid var(--border-primary)',
                    borderTopColor: 'var(--accent-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading SamarthyaBot...</span>
            </div>
        );
    }

    // Not logged in → show Homepage or Login
    if (!user) {
        if (showLogin) {
            return <LoginPage onLogin={handleLogin} onBack={() => setShowLogin(false)} />;
        }
        return <HomePage onNavigateToLogin={() => setShowLogin(true)} />;
    }

    // Logged in → App shell with sidebar
    return (
        <Router>
            <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Sidebar
                    user={user}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onLogout={handleLogout}
                />
                <main style={{
                    flex: 1,
                    minHeight: '100vh',
                }}>
                    <Routes>
                        <Route path="/" element={<DashboardPage user={user} />} />
                        <Route path="/chat" element={<ChatPage user={user} />} />
                        <Route path="/chat/:id" element={<ChatPage user={user} />} />
                        <Route path="/settings" element={<SettingsPage user={user} onUpdate={updateUser} />} />
                        <Route path="/audit" element={<AuditPage user={user} />} />
                        <Route path="/tools" element={<ToolPacksPage user={user} />} />
                        <Route path="/integrations" element={<IntegrationsPage user={user} />} />
                        <Route path="/my-stuff" element={<MyStuffPage user={user} />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
