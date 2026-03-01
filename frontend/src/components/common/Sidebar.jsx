import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    MessageSquare, LayoutDashboard, Settings, Shield, Wrench,
    LogOut, ChevronLeft, ChevronRight, Bot, Zap, HardDrive
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Control Center', labelHi: 'डैशबोर्ड', path: '/' },
    { icon: MessageSquare, label: 'Chat', labelHi: 'चैट', path: '/chat' },
    { icon: HardDrive, label: 'My Stuff', labelHi: 'मेरा डेटा', path: '/my-stuff' },
    { icon: Wrench, label: 'Tool Packs', labelHi: 'टूल पैक्स', path: '/tools' },
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
                        <span style={styles.logoChar}>स</span>
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
                            <div style={styles.userName}>{user?.name || 'User'}</div>
                            <div style={styles.userPack}>
                                {user?.activePack === 'student' ? '🎓' :
                                    user?.activePack === 'business' ? '🏢' :
                                        user?.activePack === 'developer' ? '👨‍💻' : '🏠'}
                                {' '}{user?.activePack || 'personal'} pack
                            </div>
                        </div>
                    </div>
                )}
                <button onClick={onLogout} style={styles.logoutBtn} title="Logout">
                    <LogOut size={18} />
                    {isOpen && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}

const styles = {
    sidebar: {
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: 'rgba(10, 10, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        minHeight: '72px',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        overflow: 'hidden',
    },
    logoWrap: {
        width: '38px',
        height: '38px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    logoChar: {
        fontSize: '1.3rem',
        color: '#0D0D0D',
        fontFamily: 'var(--font-hindi)',
        fontWeight: 700,
    },
    brandText: {
        display: 'flex',
        flexDirection: 'column',
        whiteSpace: 'nowrap',
    },
    brandName: {
        fontWeight: 700,
        fontSize: '1.1rem',
        color: 'var(--text-primary)',
    },
    brandSub: {
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
    },
    toggleBtn: {
        background: 'var(--bg-hover)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-secondary)',
        width: '30px',
        height: '30px',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        flexShrink: 0,
    },
    nav: {
        flex: 1,
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'transparent',
        border: 'none',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        position: 'relative',
        fontFamily: 'var(--font-primary)',
        whiteSpace: 'nowrap',
        width: '100%',
    },
    navItemActive: {
        background: 'rgba(255, 153, 51, 0.12)',
        color: 'var(--accent-primary)',
    },
    activeIndicator: {
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '3px',
        height: '60%',
        borderRadius: '0 4px 4px 0',
        background: 'var(--accent-primary)',
    },
    footer: {
        padding: '16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        overflow: 'hidden',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: '0.9rem',
        flexShrink: 0,
    },
    userText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    userName: {
        fontWeight: 600,
        fontSize: '0.85rem',
        color: 'var(--text-primary)',
    },
    userPack: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textTransform: 'capitalize',
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-primary)',
        transition: 'all var(--transition-fast)',
        whiteSpace: 'nowrap',
    }
};
