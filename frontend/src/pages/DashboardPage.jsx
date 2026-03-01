import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, auditAPI, toolsAPI, platformAPI } from '../services/api';
import {
    MessageSquare, Shield, Wrench, Clock, TrendingUp, Zap,
    AlertTriangle, ChevronRight, Activity, Globe, Brain,
    Cpu, HardDrive, Layout, Server, Terminal, Power, PlayCircle
} from 'lucide-react';

export default function DashboardPage({ user }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [platformStatus, setPlatformStatus] = useState(null);
    const [backgroundJobs, setBackgroundJobs] = useState([]);
    const [recentConvs, setRecentConvs] = useState([]);
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
        // Refresh platform data every 15 seconds for that "active OS" feel
        const interval = setInterval(() => {
            loadPlatformData();
        }, 15000);
        return () => clearInterval(interval);
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
    }

    const loadData = async () => {
        setLoading(true);
        try {
            const [convsRes, packsRes, statsRes] = await Promise.all([
                chatAPI.getConversations().catch(() => ({ data: { conversations: [] } })),
                toolsAPI.getPacks().catch(() => ({ data: { packs: [] } })),
                auditAPI.getStats().catch(() => ({ data: { stats: { totalActions: 0, byCategory: {}, byStatus: {} } } }))
            ]);

            setRecentConvs(convsRes.data.conversations?.slice(0, 5) || []);
            setPacks(packsRes.data.packs || []);
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
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    if (loading) {
        return (
            <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Activity size={40} className="spinner" style={{ color: 'var(--accent-primary)' }} />
            </div>
        )
    }

    return (
        <div style={styles.container}>
            {/* Control Center Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Control Center
                    </h1>
                    <div style={styles.systemBadge}>
                        <Server size={14} /> System Online • OS: {platformStatus?.osName || 'SamarthyaOS'}
                    </div>
                </div>
                <div style={styles.headerActions}>
                    <button
                        onClick={async () => {
                            if (window.confirm("Are you sure you want to KILL all background processes? This will stop all autonomous activity immediately.")) {
                                await platformAPI.emergencyStop();
                                loadPlatformData();
                                alert("🚨 Emergency Stop Engaged. All systems halted.");
                            }
                        }}
                        style={styles.dangerBtn}
                        title="Emergency Kill Switch"
                    >
                        <Power size={18} /> Kill Switch
                    </button>
                    <button onClick={() => navigate('/tools')} style={styles.secondaryBtn}>
                        <Wrench size={18} /> Modules
                    </button>
                    <button onClick={() => navigate('/chat')} style={styles.newChatBtn}>
                        <Zap size={18} /> Spawn Agent
                    </button>
                </div>
            </div>

            {/* Platform OS Vitals */}
            <h3 style={styles.sectionTitle}>System Vitals</h3>
            <div style={styles.statsGrid}>
                {/* Uptime */}
                <div style={{ ...styles.statCard, background: 'var(--bg-secondary)', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ ...styles.statIcon, background: '#6366f120', color: '#6366f1' }}>
                        <Clock size={22} />
                    </div>
                    <div style={styles.statInfo}>
                        <div style={styles.statValue}>{formatUptime(platformStatus?.uptime)}</div>
                        <div style={styles.statLabel}>Agent Uptime</div>
                    </div>
                </div>

                {/* RAM */}
                <div style={{ ...styles.statCard, background: 'var(--bg-secondary)', borderLeft: '4px solid #14b8a6' }}>
                    <div style={{ ...styles.statIcon, background: '#14b8a620', color: '#14b8a6' }}>
                        <Cpu size={22} />
                    </div>
                    <div style={styles.statInfo}>
                        <div style={styles.statValue}>{platformStatus?.ramUsage || 0}%</div>
                        <div style={styles.statLabel}>Memory Load</div>
                    </div>
                </div>

                {/* Plugins/Tools */}
                <div style={{ ...styles.statCard, background: 'var(--bg-secondary)', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ ...styles.statIcon, background: '#f59e0b20', color: '#f59e0b' }}>
                        <Layout size={22} />
                    </div>
                    <div style={styles.statInfo}>
                        <div style={styles.statValue}>{platformStatus?.totalTools || 0} / {platformStatus?.loadedPlugins || 0}</div>
                        <div style={styles.statLabel}>Core Tools / Plugins</div>
                    </div>
                </div>

                {/* Total Actions */}
                <div style={{ ...styles.statCard, background: 'var(--bg-secondary)', borderLeft: '4px solid #f43f5e' }}>
                    <div style={{ ...styles.statIcon, background: '#f43f5e20', color: '#f43f5e' }}>
                        <Activity size={22} />
                    </div>
                    <div style={styles.statInfo}>
                        <div style={styles.statValue}>{stats?.totalActions || 0}</div>
                        <div style={styles.statLabel}>Tasks Executed</div>
                    </div>
                </div>
            </div>

            <div style={styles.mainGrid}>
                {/* Active Background Jobs */}
                <div style={{ ...styles.card, gridColumn: 'span 2' }}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>
                            <Activity size={18} style={{ color: '#10b981' }} />
                            Autonomous Background Processes
                        </h3>
                        <span style={styles.liveBadge}><span style={styles.pulseDot}></span> LIVE</span>
                    </div>
                    <div style={styles.cardBody}>
                        {backgroundJobs.length > 0 ? (
                            <div style={styles.jobsList}>
                                {backgroundJobs.map(job => (
                                    <div key={job._id} style={styles.jobCard}>
                                        <div style={styles.jobHeader}>
                                            <span style={styles.jobName}>{job.taskName}</span>
                                            <span style={job.isActive ? styles.jobActive : styles.jobInactive}>
                                                {job.isActive ? 'RUNNING' : 'STOPPED'}
                                            </span>
                                        </div>
                                        <div style={styles.jobPrompt}>"{job.prompt}"</div>
                                        <div style={styles.jobMeta}>
                                            <span><Clock size={12} /> Interval: {job.intervalMinutes}m</span>
                                            <span><PlayCircle size={12} /> Next Run: {new Date(job.nextRunAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={styles.emptyState}>
                                <HardDrive size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                                <p>No autonomous background tasks running.</p>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Ask the agent to "schedule a background task" to monitor processes!
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Processes (Conversations) */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>
                            <MessageSquare size={18} style={{ color: 'var(--accent-primary)' }} />
                            Recent Interactions
                        </h3>
                        <button onClick={() => navigate('/chat')} style={styles.viewAllBtn}>
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div style={styles.cardBody}>
                        {recentConvs.length > 0 ? recentConvs.map(conv => (
                            <button key={conv._id} onClick={() => navigate(`/chat/${conv._id}`)} style={styles.convRow}>
                                <div style={styles.convDot} />
                                <div style={styles.convInfo}>
                                    <span style={styles.convName}>{conv.title}</span>
                                    <span style={styles.convTime}>
                                        {new Date(conv.updatedAt).toLocaleDateString()} {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                            </button>
                        )) : (
                            <div style={styles.emptyState}>
                                <p>System idle. No recent sessions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Memory & Plugin Banner */}
            <div style={styles.bannerGrid}>
                <div style={styles.vaultBanner}>
                    <Shield size={24} style={{ color: '#10b981' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Encrypted Memory Vault Active</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>AES-256-CBC encryption enabled for secrets and PI data.</div>
                    </div>
                    <button onClick={() => navigate('/settings')} style={styles.outlineBtn}>Configure</button>
                </div>

                <div style={styles.pluginBanner}>
                    <Power size={24} style={{ color: '#f59e0b' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Extensibility Engine</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Drop JS modules in ~/SamarthyaBot_Files/plugins/ to expand OS.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '28px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        animation: 'fadeIn 0.4s ease-out',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 800,
        color: 'var(--text-primary)',
        letterSpacing: '-0.5px'
    },
    systemBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 600,
        marginTop: '8px'
    },
    headerActions: {
        display: 'flex',
        gap: '12px'
    },
    dangerBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    secondaryBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    newChatBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 24px',
        background: 'var(--gradient-primary)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.95rem',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
        transition: 'all 0.2s',
    },
    sectionTitle: {
        fontSize: '1.2rem',
        fontWeight: 600,
        marginBottom: '16px',
        color: 'var(--text-secondary)'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
    },
    statCard: {
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    },
    statIcon: {
        width: '44px',
        height: '44px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statInfo: {
        flex: 1,
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    statLabel: {
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        fontWeight: 500,
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '28px',
    },
    card: {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(0,0,0,0.02)'
    },
    cardTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '1.05rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
    },
    liveBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#10b981',
        background: 'rgba(16, 185, 129, 0.1)',
        padding: '4px 8px',
        borderRadius: '4px'
    },
    pulseDot: {
        width: '6px',
        height: '6px',
        backgroundColor: '#10b981',
        borderRadius: '50%',
        boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)',
        animation: 'pulse 1.5s infinite'
    },
    viewAllBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        color: 'var(--accent-primary)',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
    },
    cardBody: {
        padding: '16px',
    },
    jobsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    jobCard: {
        background: 'var(--bg-main)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '14px',
    },
    jobHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    jobName: {
        fontWeight: 600,
        fontSize: '0.95rem',
        color: 'var(--text-primary)'
    },
    jobActive: {
        fontSize: '0.7rem',
        padding: '2px 6px',
        background: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
        borderRadius: '4px',
        fontWeight: 700
    },
    jobInactive: {
        fontSize: '0.7rem',
        padding: '2px 6px',
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        borderRadius: '4px',
        fontWeight: 700
    },
    jobPrompt: {
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        lineHeight: 1.4,
        marginBottom: '10px'
    },
    jobMeta: {
        display: 'flex',
        gap: '16px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
    },
    convRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderRadius: '8px',
        background: 'transparent',
        border: 'none',
        width: '100%',
        cursor: 'pointer',
        textAlign: 'left',
        color: 'var(--text-primary)',
    },
    convDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'var(--accent-primary)',
        flexShrink: 0,
    },
    convInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0,
    },
    convName: {
        fontSize: '0.9rem',
        fontWeight: 500,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    convTime: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 16px',
        color: 'var(--text-muted)',
        textAlign: 'center',
    },
    bannerGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    },
    vaultBanner: {
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        color: 'var(--text-primary)'
    },
    pluginBanner: {
        background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.05) 100%)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        color: 'var(--text-primary)'
    },
    outlineBtn: {
        padding: '6px 16px',
        fontSize: '0.8rem',
        background: 'transparent',
        border: '1px solid #10b981',
        color: '#10b981',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 600
    }
};

// Add global styles for pulse animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
`;
document.head.appendChild(styleSheet);
