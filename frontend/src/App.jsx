import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import AuditPage from './pages/AuditPage';
import ToolPacksPage from './pages/ToolPacksPage';
import IntegrationsPage from './pages/IntegrationsPage';
import MyStuffPage from './pages/MyStuffPage';
import { authAPI } from './services/api';

// Content wrapper — Dashboard is the default landing page (no HomePage)
const AppContent = ({ user, loading, updateUser, sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', background: 'var(--bg-primary)' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid var(--border-primary)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Loading SamarthyaBot...</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar
                user={user}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <main style={{ flex: 1, minHeight: '100vh' }}>
                <Routes>
                    <Route path="/" element={<DashboardPage user={user} />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
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
    );
};

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await authAPI.getProfile();
                setUser(res.data.user);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <Router>
            <AppContent
                user={user}
                loading={loading}
                updateUser={updateUser}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
        </Router>
    );
}

export default App;
