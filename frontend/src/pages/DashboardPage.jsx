import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, auditAPI, toolsAPI, platformAPI } from '../services/api';
import {
    MessageSquare, Shield, Wrench, Clock, TrendingUp, Zap,
    AlertTriangle, ChevronRight, Activity, Globe, Brain,
    Cpu, HardDrive, Layout, Server, Terminal, Power, PlayCircle,
    Wifi, WifiOff, Lock, Unlock, Heart, Rocket, Bot, Sparkles,
    Radio, Eye, Plug, ArrowRight
} from 'lucide-react';

// ── Indian Flag Color System ──
const SAFFRON = '#FF9933';
const WHITE = '#FFFFFF';
const GREEN = '#138808';
const NAVY = '#000080';
const SAFFRON_GLOW = 'rgba(255,153,51,0.15)';
const GREEN_GLOW = 'rgba(19,136,8,0.15)';

export default function DashboardPage({ user }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [platformStatus, setPlatformStatus] = useState(null);
    const [backgroundJobs, setBackgroundJobs] = useState([]);
    const [recentConvs, setRecentConvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        loadData();
        const interval = setInterval(() => loadPlatformData(), 15000);
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => { clearInterval(interval); clearInterval(clockInterval); };
    }, []);

    const loadPlatformData = async () => {
        try {
            const [statusRes, jobsRes] = await Promise.all([
                platformAPI.getStatus().catch(() => ({ data: { status: null } })),
                platformAPI.getJobs().catch(() => ({ data: { jobs: [] } }))
            ]);
            setPlatformStatus(statusRes.data.status);
            setBackgroundJobs(jobsRes.data.jobs || []);
        } catch (e) { }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [convsRes, statsRes] = await Promise.all([
                chatAPI.getConversations().catch(() => ({ data: { conversations: [] } })),
                auditAPI.getStats().catch(() => ({ data: { stats: { totalActions: 0, byCategory: {}, byStatus: {} } } }))
            ]);
            setRecentConvs(convsRes.data.conversations?.slice(0, 5) || []);
            setStats(statsRes.data.stats);
            await loadPlatformData();
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatUptime = (seconds) => {
        if (!seconds) return '0h 0m';
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (d > 0) return `${d}d ${h}h`;
        return `${h}h ${m}m`;
    };

    const getGreeting = () => {
        const h = currentTime.getHours();
        if (h < 5) return '🌙 Good Night';
        if (h < 12) return '🌅 Good Morning';
        if (h < 17) return '☀️ Good Afternoon';
        if (h < 21) return '🌆 Good Evening';
        return '🌙 Good Night';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0f', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', border: `3px solid ${SAFFRON}20`, borderTopColor: SAFFRON, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ color: '#888', fontSize: '0.9rem' }}>Initializing SamarthyaBot...</span>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* ── Saffron Accent Line at Top ── */}
            <div style={{ height: '3px', background: `linear-gradient(90deg, ${SAFFRON}, ${WHITE}40, ${GREEN})`, borderRadius: '4px', marginBottom: '28px' }} />

            {/* ── Hero Header ── */}
            <div style={styles.heroSection}>
                <div style={styles.heroLeft}>
                    <div style={styles.greeting}>{getGreeting()}</div>
                    <h1 style={styles.heroTitle}>
                        <span style={{ color: SAFFRON }}>Samarthya</span>
                        <span style={{ color: '#e0e0e0' }}>Bot</span>
                        <span style={styles.versionBadge}>v2.0</span>
                    </h1>
                    <p style={styles.heroSub}>
                        🇮🇳 Privacy-first Agentic AI · {currentTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST
                    </p>
                    <div style={styles.statusRow}>
                        <span style={styles.onlinePill}><span style={styles.pulseDot} /> ONLINE</span>
                        <span style={styles.infoPill}><Brain size={12} /> {platformStatus?.activeProvider?.toUpperCase() || 'GEMINI'}</span>
                        <span style={styles.infoPill}><Server size={12} /> {platformStatus?.osName || 'Linux'}</span>
                    </div>
                </div>
                <div style={styles.heroRight}>
                    <button onClick={() => navigate('/chat')} style={styles.heroBtn}>
                        <Zap size={20} /> Talk to Agent
                    </button>
                    <button
                        onClick={async () => {
                            if (window.confirm("🚨 Kill all background processes?")) {
                                await platformAPI.emergencyStop();
                                loadPlatformData();
                            }
                        }}
                        style={styles.killBtn}
                    >
                        <Power size={16} /> Kill Switch
                    </button>
                </div>
            </div>

            {/* ── Stat Cards Grid ── */}
            <div style={styles.statsGrid}>
                <StatCard
                    icon={<Clock size={24} />}
                    value={formatUptime(platformStatus?.uptime)}
                    label="Agent Uptime"
                    color="#818cf8"
                    gradient="linear-gradient(135deg, rgba(129,140,248,0.15), rgba(99,102,241,0.05))"
                />
                <StatCard
                    icon={<Cpu size={24} />}
                    value={`${platformStatus?.ramUsage || 0}%`}
                    label="Memory Usage"
                    color="#2dd4bf"
                    gradient="linear-gradient(135deg, rgba(45,212,191,0.15), rgba(20,184,166,0.05))"
                />
                <StatCard
                    icon={<Activity size={24} />}
                    value={stats?.totalActions || 0}
                    label="Tasks Executed"
                    color={SAFFRON}
                    gradient={`linear-gradient(135deg, ${SAFFRON_GLOW}, rgba(255,153,51,0.03))`}
                />
                <StatCard
                    icon={<Plug size={24} />}
                    value={`${platformStatus?.totalTools || 0}`}
                    label="Active Tools"
                    color={GREEN}
                    gradient={`linear-gradient(135deg, ${GREEN_GLOW}, rgba(19,136,8,0.03))`}
                />
            </div>

            {/* ── Main Grid: 2 columns ── */}
            <div style={styles.mainGrid}>

                {/* Left Column — Background Processes */}
                <div style={styles.glassCard}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitleRow}>
                            <Activity size={18} style={{ color: '#10b981' }} />
                            <span style={styles.cardTitle}>Autonomous Processes</span>
                        </div>
                        <span style={styles.liveBadge}><span style={styles.pulseDotSmall} /> LIVE</span>
                    </div>
                    <div style={styles.cardBody}>
                        {backgroundJobs.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {backgroundJobs.map(job => (
                                    <div key={job._id} style={styles.jobCard}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 600, color: '#e0e0e0', fontSize: '0.9rem' }}>{job.taskName}</span>
                                            <span style={job.isActive ? styles.activePill : styles.stoppedPill}>
                                                {job.isActive ? '● RUNNING' : '○ STOPPED'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', marginBottom: '6px' }}>"{job.prompt}"</div>
                                        <div style={{ display: 'flex', gap: '14px', fontSize: '0.72rem', color: '#666' }}>
                                            <span><Clock size={11} /> {job.intervalMinutes}m</span>
                                            <span><PlayCircle size={11} /> Next: {new Date(job.nextRunAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={styles.emptyState}>
                                <Bot size={36} style={{ color: '#333', marginBottom: '8px' }} />
                                <p style={{ color: '#666', margin: 0 }}>No autonomous tasks running</p>
                                <span style={{ fontSize: '0.75rem', color: '#555' }}>Ask the agent to schedule a background task!</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column — Recent Interactions */}
                <div style={styles.glassCard}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitleRow}>
                            <MessageSquare size={18} style={{ color: SAFFRON }} />
                            <span style={styles.cardTitle}>Recent Interactions</span>
                        </div>
                        <button onClick={() => navigate('/chat')} style={styles.linkBtn}>
                            All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div style={styles.cardBody}>
                        {recentConvs.length > 0 ? recentConvs.map(conv => (
                            <button key={conv._id} onClick={() => navigate(`/chat/${conv._id}`)} style={styles.convRow}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: SAFFRON, flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.title}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#666' }}>
                                        {new Date(conv.updatedAt).toLocaleDateString('en-IN')} · {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <ArrowRight size={14} style={{ color: '#444' }} />
                            </button>
                        )) : (
                            <div style={styles.emptyState}>
                                <MessageSquare size={32} style={{ color: '#333' }} />
                                <p style={{ color: '#666', margin: '8px 0 0' }}>No conversations yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Services Status Bar ── */}
            <div style={styles.servicesBar}>
                <ServiceChip icon="🔒" label="Vault" active />
                <ServiceChip icon="🔐" label="Sandbox" active />
                <ServiceChip icon="💓" label="Heartbeat" active />
                <ServiceChip icon="🎙️" label="Voice" />
                <ServiceChip icon="🚀" label="Spawn" active />
                <ServiceChip icon="🔌" label="Plugins" active />
                <ServiceChip icon="🟣" label="Discord" />
                <ServiceChip icon="✈️" label="Telegram" />
            </div>

            {/* ── Quick Actions ── */}
            <div style={styles.quickGrid}>
                <QuickAction icon={<Wrench size={20} />} label="Tool Packs" sub="Manage agents" color="#818cf8" onClick={() => navigate('/tools')} />
                <QuickAction icon={<Shield size={20} />} label="Audit Log" sub="Execution history" color="#10b981" onClick={() => navigate('/audit')} />
                <QuickAction icon={<Globe size={20} />} label="Integrations" sub="Channels & APIs" color={SAFFRON} onClick={() => navigate('/integrations')} />
                <QuickAction icon={<Layout size={20} />} label="Settings" sub="Configure agent" color="#f472b6" onClick={() => navigate('/settings')} />
            </div>

            {/* ── Footer Branding ── */}
            <div style={styles.footer}>
                <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${SAFFRON}40, ${GREEN}40, transparent)`, marginBottom: '16px' }} />
                <span style={{ color: '#444', fontSize: '0.78rem' }}>
                    🇮🇳 Built with ❤️ in India by Bishnu Sahu · SamarthyaBot v2.0.0
                </span>
            </div>
        </div>
    );
}

// ── Reusable Components ──

function StatCard({ icon, value, label, color, gradient }) {
    return (
        <div style={{
            background: gradient,
            border: `1px solid ${color}20`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${color}15`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${color}18`, color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#e8e8e8', lineHeight: 1.1 }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500, marginTop: '2px' }}>{label}</div>
            </div>
        </div>
    );
}

function ServiceChip({ icon, label, active }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '20px',
            background: active ? 'rgba(19,136,8,0.08)' : 'rgba(100,100,100,0.08)',
            border: `1px solid ${active ? 'rgba(19,136,8,0.2)' : 'rgba(100,100,100,0.15)'}`,
            fontSize: '0.78rem', fontWeight: 500,
            color: active ? '#4ade80' : '#666',
        }}>
            <span>{icon}</span>
            <span>{label}</span>
            {active && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80' }} />}
        </div>
    );
}

function QuickAction({ icon, label, sub, color, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: '#e0e0e0',
                textAlign: 'left',
                width: '100%',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}30`; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
        >
            <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${color}15`, color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>{sub}</div>
            </div>
            <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#444' }} />
        </button>
    );
}

// ── Styles ──

const styles = {
    container: {
        padding: '24px 32px 40px',
        maxWidth: '1100px',
        margin: '0 auto',
        animation: 'fadeIn 0.4s ease-out',
        minHeight: '100vh',
        background: '#0a0a0f',
    },
    heroSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px',
    },
    heroLeft: {},
    heroRight: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    greeting: {
        fontSize: '0.9rem',
        color: '#888',
        marginBottom: '4px',
        fontWeight: 500,
    },
    heroTitle: {
        fontSize: '2.2rem',
        fontWeight: 800,
        letterSpacing: '-1px',
        margin: 0,
        lineHeight: 1.1,
    },
    versionBadge: {
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '2px 8px',
        background: `${SAFFRON}20`,
        color: SAFFRON,
        borderRadius: '6px',
        marginLeft: '10px',
        verticalAlign: 'super',
    },
    heroSub: {
        color: '#666',
        fontSize: '0.85rem',
        marginTop: '8px',
        marginBottom: '12px',
    },
    statusRow: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    onlinePill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: 'rgba(16,185,129,0.1)',
        color: '#4ade80',
        borderRadius: '20px',
        fontSize: '0.72rem',
        fontWeight: 700,
        border: '1px solid rgba(16,185,129,0.2)',
    },
    infoPill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        background: 'rgba(255,255,255,0.04)',
        color: '#888',
        borderRadius: '20px',
        fontSize: '0.72rem',
        fontWeight: 500,
        border: '1px solid rgba(255,255,255,0.08)',
    },
    pulseDot: {
        width: '7px', height: '7px',
        backgroundColor: '#4ade80',
        borderRadius: '50%',
        boxShadow: '0 0 0 0 rgba(74,222,128,0.7)',
        animation: 'pulse 1.5s infinite',
    },
    pulseDotSmall: {
        width: '5px', height: '5px',
        backgroundColor: '#10b981',
        borderRadius: '50%',
        animation: 'pulse 1.5s infinite',
    },
    heroBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 28px',
        background: `linear-gradient(135deg, ${SAFFRON}, #e67300)`,
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '0.95rem',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: `0 4px 20px ${SAFFRON}40`,
        transition: 'all 0.2s',
    },
    killBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px',
        background: 'rgba(239,68,68,0.08)',
        color: '#f87171',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '10px',
        fontSize: '0.82rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
    },
    glassCard: {
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    cardTitleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    cardTitle: {
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#d0d0d0',
    },
    liveBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.68rem',
        fontWeight: 700,
        color: '#10b981',
        background: 'rgba(16,185,129,0.1)',
        padding: '3px 8px',
        borderRadius: '6px',
    },
    linkBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        background: 'none',
        border: 'none',
        color: SAFFRON,
        fontSize: '0.82rem',
        fontWeight: 600,
        cursor: 'pointer',
    },
    cardBody: {
        padding: '14px 18px',
    },
    jobCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '10px',
        padding: '12px',
    },
    activePill: {
        fontSize: '0.65rem',
        padding: '2px 8px',
        background: 'rgba(16,185,129,0.1)',
        color: '#4ade80',
        borderRadius: '6px',
        fontWeight: 700,
    },
    stoppedPill: {
        fontSize: '0.65rem',
        padding: '2px 8px',
        background: 'rgba(239,68,68,0.08)',
        color: '#f87171',
        borderRadius: '6px',
        fontWeight: 700,
    },
    convRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 8px',
        borderRadius: '10px',
        background: 'transparent',
        border: 'none',
        width: '100%',
        cursor: 'pointer',
        textAlign: 'left',
        color: '#e0e0e0',
        transition: 'background 0.15s',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '36px 16px',
        textAlign: 'center',
    },
    servicesBar: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '24px',
        padding: '16px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.04)',
    },
    quickGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '12px',
        marginBottom: '32px',
    },
    footer: {
        textAlign: 'center',
        paddingTop: '8px',
    },
};

// ── Global Animations ──
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
    to { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleSheet);
