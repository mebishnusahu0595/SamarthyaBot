import React, { useState, useEffect } from 'react';
import { auditAPI } from '../services/api';
import { Shield, Clock, AlertTriangle, RotateCcw, Filter, Activity } from 'lucide-react';

const categoryColors = {
    file: { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', icon: '📁' },
    email: { bg: 'rgba(14,165,233,0.1)', color: '#0ea5e9', icon: '📧' },
    browser: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', icon: '🌐' },
    calendar: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', icon: '📅' },
    search: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', icon: '🔍' },
    system: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', icon: '⚙️' },
    security: { bg: 'rgba(244,63,94,0.1)', color: '#f43f5e', icon: '🔐' },
    tool: { bg: 'rgba(20,184,166,0.1)', color: '#14b8a6', icon: '🛠️' },
};

const statusColors = {
    success: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    failed: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    blocked: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    rolled_back: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
};

export default function AuditPage({ user }) {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.category = filter;

            const [logsRes, statsRes] = await Promise.all([
                auditAPI.getLogs(params),
                auditAPI.getStats(),
            ]);

            setLogs(logsRes.data.logs || []);
            setStats(statsRes.data.stats || null);
        } catch (err) {
            console.error('Failed to load audit data');
            setLogs([]);
            setStats({ totalActions: 0, byCategory: {}, byStatus: {} });
        } finally {
            setLoading(false);
        }
    };

    const handleRollback = async (id) => {
        try {
            await auditAPI.rollback(id);
            loadData();
        } catch (err) {
            console.error('Rollback failed');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>🔐 Audit Log / ऑडिट लॉग</h1>
                    <p style={styles.subtitle}>Full action replay timeline • हर एक्शन की पूरी जानकारी</p>
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <Activity size={20} style={{ color: 'var(--accent-primary)' }} />
                    <div>
                        <div style={styles.statValue}>{stats?.totalActions || 0}</div>
                        <div style={styles.statLabel}>Total Actions</div>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <Shield size={20} style={{ color: '#10b981' }} />
                    <div>
                        <div style={styles.statValue}>{stats?.byStatus?.success || 0}</div>
                        <div style={styles.statLabel}>Successful</div>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                    <div>
                        <div style={styles.statValue}>{stats?.byStatus?.blocked || 0}</div>
                        <div style={styles.statLabel}>Blocked</div>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <RotateCcw size={20} style={{ color: '#8b5cf6' }} />
                    <div>
                        <div style={styles.statValue}>{stats?.byStatus?.rolled_back || 0}</div>
                        <div style={styles.statLabel}>Rolled Back</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={styles.filters}>
                <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                <button
                    onClick={() => setFilter('')}
                    style={{ ...styles.filterBtn, ...(filter === '' ? styles.filterBtnActive : {}) }}
                >
                    All
                </button>
                {Object.entries(categoryColors).map(([cat, config]) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{ ...styles.filterBtn, ...(filter === cat ? styles.filterBtnActive : {}) }}
                    >
                        {config.icon} {cat}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div style={styles.timeline}>
                {loading ? (
                    <div style={styles.loadingState}>
                        <div style={styles.spinner} />
                        <span>Loading audit logs...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Shield size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                        <p>No audit logs yet. Start chatting with SamarthyaBot to see activity here.</p>
                    </div>
                ) : (
                    logs.map((log, i) => {
                        const catConfig = categoryColors[log.category] || categoryColors.system;
                        const statusConfig = statusColors[log.status] || statusColors.success;

                        return (
                            <div key={log._id || i} style={styles.logEntry}>
                                <div style={styles.logTimeline}>
                                    <div style={{
                                        ...styles.logDot,
                                        background: catConfig.color,
                                    }} />
                                    {i < logs.length - 1 && <div style={styles.logLine} />}
                                </div>
                                <div style={styles.logContent}>
                                    <div style={styles.logHeader}>
                                        <span style={{
                                            ...styles.logCategory,
                                            background: catConfig.bg,
                                            color: catConfig.color,
                                        }}>
                                            {catConfig.icon} {log.category}
                                        </span>
                                        <span style={{
                                            ...styles.logStatus,
                                            background: statusConfig.bg,
                                            color: statusConfig.color,
                                        }}>
                                            {log.status}
                                        </span>
                                        {log.details?.riskLevel && log.details.riskLevel !== 'low' && (
                                            <span style={styles.riskBadge}>
                                                ⚠️ {log.details.riskLevel} risk
                                            </span>
                                        )}
                                    </div>
                                    <div style={styles.logAction}>{log.action}</div>
                                    {log.details?.toolName && (
                                        <div style={styles.logDetail}>Tool: {log.details.toolName}</div>
                                    )}
                                    <div style={styles.logTime}>
                                        <Clock size={12} />
                                        {new Date(log.createdAt).toLocaleString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                                        })}
                                    </div>
                                    {log.canRollback && log.status !== 'rolled_back' && (
                                        <button onClick={() => handleRollback(log._id)} style={styles.rollbackBtn}>
                                            <RotateCcw size={14} /> Undo / Rollback
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '28px 32px',
        maxWidth: '900px',
        margin: '0 auto',
        animation: 'fadeIn 0.4s ease-out',
    },
    header: {
        marginBottom: '24px',
    },
    title: {
        fontSize: '1.6rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    subtitle: {
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        marginTop: '4px',
    },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '18px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
    },
    statValue: {
        fontSize: '1.3rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    statLabel: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
    },
    filters: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '20px',
        flexWrap: 'wrap',
        border: '1px solid var(--border-subtle)',
    },
    filterBtn: {
        padding: '6px 12px',
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        color: 'var(--text-muted)',
        fontSize: '0.78rem',
        cursor: 'pointer',
        fontFamily: 'var(--font-primary)',
        textTransform: 'capitalize',
        transition: 'all var(--transition-fast)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    filterBtnActive: {
        background: 'rgba(99, 102, 241, 0.15)',
        borderColor: 'var(--accent-primary)',
        color: 'var(--accent-primary)',
    },
    timeline: {
        display: 'flex',
        flexDirection: 'column',
    },
    logEntry: {
        display: 'flex',
        gap: '16px',
    },
    logTimeline: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '20px',
        flexShrink: 0,
    },
    logDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    logLine: {
        width: '2px',
        flex: 1,
        background: 'var(--border-subtle)',
        marginTop: '4px',
        marginBottom: '4px',
    },
    logContent: {
        flex: 1,
        padding: '14px 18px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '12px',
    },
    logHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        flexWrap: 'wrap',
    },
    logCategory: {
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.72rem',
        fontWeight: 600,
        textTransform: 'capitalize',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
    },
    logStatus: {
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.72rem',
        fontWeight: 600,
        textTransform: 'capitalize',
    },
    riskBadge: {
        fontSize: '0.72rem',
        color: '#f59e0b',
    },
    logAction: {
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: '4px',
    },
    logDetail: {
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginBottom: '4px',
    },
    logTime: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
    },
    rollbackBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '8px',
        padding: '6px 14px',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: 'var(--radius-sm)',
        color: '#8b5cf6',
        fontSize: '0.78rem',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'var(--font-primary)',
        transition: 'all var(--transition-fast)',
    },
    loadingState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '60px 20px',
        color: 'var(--text-muted)',
    },
    spinner: {
        width: '24px',
        height: '24px',
        border: '2px solid var(--border-primary)',
        borderTopColor: 'var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 20px',
        color: 'var(--text-muted)',
        textAlign: 'center',
        fontSize: '0.9rem',
    },
};
