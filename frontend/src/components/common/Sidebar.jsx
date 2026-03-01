import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    MessageSquare, LayoutDashboard, Settings, Shield, Wrench,
    LogOut, ChevronLeft, ChevronRight, Bot, Zap, HardDrive
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Control Center', labelHi: 'डैशबोर्ड', path: '/dashboard' },
    { icon: MessageSquare, label: 'Chat', labelHi: 'चैट', path: '/chat' },
    { icon: HardDrive, label: 'My Stuff', labelHi: 'मेरा डेटा', path: '/my-stuff' },
    { icon: Wrench, label: 'Modules', path: '/tools' },
    { icon: Zap, label: 'Integrations', labelHi: 'इंटीग्रेशन', path: '/integrations' },
    { icon: Shield, label: 'Audit Log', labelHi: 'ऑडिट लॉग', path: '/audit' },
    { icon: Settings, label: 'Settings', labelHi: 'सेटिंग्स', path: '/settings' },
];

export default function Sidebar({ user, isOpen, onToggle, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside style={{
            ...styles.sidebar,
            width: isOpen ? '280px' : '72px',
            resize: isOpen ? 'horizontal' : 'none',
            minWidth: isOpen ? '200px' : '72px',
            maxWidth: isOpen ? '500px' : '72px',
        }}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.brand} onClick={() => navigate('/')}>
                    <div style={styles.logoWrap}>
                        <img src="/logo.png" alt="SamarthyaBot" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    </div>
                    {isOpen && (
                        <div style={styles.brandText}>
                            <span style={styles.brandName}>SamarthyaBot</span>
                            <span style={styles.brandSub}>v1.0.0</span>
                        </div>
                    )}
                </div>
                <button onClick={onToggle} style={styles.toggleBtn}>
                    {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav style={styles.nav}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                ...styles.navItem,
                                ...(isActive ? styles.navItemActive : {}),
                                justifyContent: isOpen ? 'flex-start' : 'center',
                            }}
                            title={!isOpen ? item.label : undefined}
                        >
                            <Icon size={20} style={{ minWidth: '20px' }} />
                            {isOpen && <span>{item.label}</span>}
                            {isActive && <div style={styles.activeIndicator} />}
                        </button>
                    );
                })}
            </nav>

            {/* User Info */}
            <div style={styles.footer}>
                {isOpen && (
                    <div style={styles.userInfo}>
                        <div style={styles.avatar}>
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.userText}>
                            <div style={styles.userName}>{user?.name || 'Local Admin'}</div>
                            <div style={styles.userStatus}>AI Agent Operator</div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}

const styles = {
    sidebar: {
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: 'rgba(6, 6, 10, 0.97)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid #1e1e28',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 14px',
        borderBottom: '1px solid #1e1e28',
        minHeight: '68px',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        overflow: 'hidden',
    },
    logoWrap: {
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: '#0e0e16',
        border: '1px solid #2a2a38',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
    },
    brandText: {
        display: 'flex',
        flexDirection: 'column',
        whiteSpace: 'nowrap',
    },
    brandName: {
        fontWeight: 800,
        fontSize: '1rem',
        color: '#f0f0ff',
        letterSpacing: '-0.3px',
    },
    brandSub: {
        fontSize: '0.68rem',
        color: '#3a3a4e',
        fontWeight: 600,
        letterSpacing: '0.5px',
    },
    toggleBtn: {
        background: 'transparent',
        border: '1px solid #1e1e28',
        color: '#3a3a4e',
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        flexShrink: 0,
    },
    nav: {
        flex: 1,
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '10px',
        background: 'transparent',
        border: 'none',
        color: '#8888a8',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        position: 'relative',
        fontFamily: "'Inter', -apple-system, sans-serif",
        whiteSpace: 'nowrap',
        width: '100%',
    },
    navItemActive: {
        background: 'rgba(255, 153, 51, 0.10)',
        color: '#FF9933',
        borderLeft: '2px solid #FF9933',
    },
    activeIndicator: {
        display: 'none',
    },
    footer: {
        padding: '14px',
        borderTop: '1px solid #1e1e28',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        overflow: 'hidden',
        padding: '8px 10px',
        borderRadius: '10px',
        background: '#0e0e16',
        border: '1px solid #1e1e28',
    },
    avatar: {
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg,#FF9933,#e8851d)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: '0.88rem',
        flexShrink: 0,
    },
    userText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    userName: {
        fontWeight: 700,
        fontSize: '0.83rem',
        color: '#f0f0ff',
    },
    userStatus: {
        fontSize: '0.72rem',
        color: '#3a3a4e',
        marginTop: '2px',
    },
};
