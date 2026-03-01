import React, { useState, useEffect } from 'react';
import { toolsAPI, authAPI } from '../services/api';
import { Wrench, Check, ChevronRight, Zap, Shield, AlertTriangle } from 'lucide-react';

const riskColors = {
    low: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: '🟢 Low Risk' },
    medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: '🟡 Medium Risk' },
    high: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: '🔴 High Risk' },
};

export default function ToolPacksPage({ user }) {
    const [packs, setPacks] = useState([]);
    const [allTools, setAllTools] = useState([]);
    const [selectedPack, setSelectedPack] = useState(null);
    const [packTools, setPackTools] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [packsRes, toolsRes] = await Promise.all([
                toolsAPI.getPacks(),
                toolsAPI.getAll(),
            ]);
            setPacks(packsRes.data.packs || []);
            setAllTools(toolsRes.data.tools || []);
        } catch (err) {
            console.error('Failed to load tools');
        }
    };

    const selectPack = async (packId) => {
        setSelectedPack(packId);
        try {
            const res = await toolsAPI.getPackTools(packId);
            setPackTools(res.data.tools || []);
        } catch (err) {
            setPackTools([]);
        }
    };

    const activatePack = async (packId) => {
        try {
            await authAPI.updateProfile({ activePack: packId });
        } catch (err) {
            console.error('Failed to activate pack');
        }
    };

    const isEng = user?.language === 'english';

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>🛠️ {isEng ? 'Tool Packs' : 'टूल पैक्स'}</h1>
                    <p style={styles.subtitle}>
                        {isEng ? 'Choose the right tool pack for your workflow' : 'अपने काम के हिसाब से पैक चुनो'}
                    </p>
                </div>
            </div>

            {/* Pack Cards */}
            <div style={styles.packsGrid}>
                {packs.map((pack, i) => {
                    const isActive = user?.activePack === pack.id;
                    const isSelected = selectedPack === pack.id;
                    return (
                        <div
                            key={pack.id}
                            onClick={() => selectPack(pack.id)}
                            style={{
                                ...styles.packCard,
                                ...(isActive ? styles.packCardActive : {}),
                                ...(isSelected ? styles.packCardSelected : {}),
                                animationDelay: `${i * 0.1}s`,
                            }}
                        >
                            <div style={styles.packHeader}>
                                <span style={styles.packEmoji}>
                                    {pack.id === 'student' ? '🎓' : pack.id === 'business' ? '🏢' :
                                        pack.id === 'developer' ? '👨‍💻' : '🏠'}
                                </span>
                                {isActive && (
                                    <span style={styles.activeBadge}>
                                        <Check size={12} /> {isEng ? 'Active' : 'सक्रिय'}
                                    </span>
                                )}
                            </div>
                            <h3 style={styles.packName}>{isEng ? pack.name : (pack.nameHi || pack.name)}</h3>
                            <p style={styles.packDesc}>{isEng ? pack.description : (pack.descriptionHi || pack.description)}</p>
                            <div style={styles.packMeta}>
                                <span style={styles.toolCount}>
                                    <Wrench size={14} /> {pack.toolCount} tools
                                </span>
                                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            {!isActive && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); activatePack(pack.id); }}
                                    style={styles.activateBtn}
                                >
                                    <Zap size={14} /> {isEng ? 'Activate' : 'एक्टिवेट करें'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* All Tools */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    <Wrench size={20} style={{ color: 'var(--accent-primary)' }} />
                    {selectedPack
                        ? (isEng ? `Tools in ${selectedPack} pack` : `${selectedPack} पैक के टूल्स`)
                        : (isEng ? 'All Available Tools' : 'सभी टूल्स')}
                </h2>
                <div style={styles.toolsGrid}>
                    {(selectedPack ? packTools : allTools).map((tool, i) => {
                        const risk = riskColors[tool.riskLevel] || riskColors.low;
                        return (
                            <div key={tool.name} style={{ ...styles.toolCard, animationDelay: `${i * 0.05}s` }}>
                                <div style={styles.toolHeader}>
                                    <span style={styles.toolName}>{tool.name}</span>
                                    <span style={{
                                        ...styles.riskBadge,
                                        background: risk.bg,
                                        color: risk.color,
                                    }}>
                                        {risk.label}
                                    </span>
                                </div>
                                <p style={styles.toolDesc}>{isEng ? tool.description : (tool.descriptionHi || tool.description)}</p>
                                <div style={styles.toolMeta}>
                                    <span style={styles.toolCategory}>
                                        {tool.category === 'file' ? '📁' : tool.category === 'email' ? '📧' :
                                            tool.category === 'search' ? '🔍' : tool.category === 'calendar' ? '📅' : '🛠️'}
                                        {' '}{tool.category}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '28px 32px',
        maxWidth: '1100px',
        margin: '0 auto',
        animation: 'fadeIn 0.4s ease-out',
    },
    header: {
        marginBottom: '28px',
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
    packsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
    },
    packCard: {
        padding: '22px',
        background: 'var(--bg-secondary)',
        border: '2px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'all var(--transition-normal)',
        animation: 'fadeInUp 0.4s ease-out both',
    },
    packCardActive: {
        borderColor: 'var(--accent-primary)',
        background: 'rgba(99, 102, 241, 0.05)',
    },
    packCardSelected: {
        borderColor: 'var(--accent-gold)',
        boxShadow: '0 0 16px rgba(245, 158, 11, 0.15)',
    },
    packHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
    },
    packEmoji: {
        fontSize: '2rem',
    },
    activeBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        background: 'rgba(99, 102, 241, 0.15)',
        color: 'var(--accent-primary)',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.72rem',
        fontWeight: 600,
    },
    packName: {
        fontSize: '1.05rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '2px',
    },
    packNameHi: {
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-hindi)',
        marginBottom: '8px',
    },
    packDesc: {
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        marginBottom: '12px',
    },
    packMeta: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toolCount: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
    },
    activateBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        padding: '10px',
        marginTop: '14px',
        background: 'var(--gradient-primary)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-primary)',
        transition: 'all var(--transition-fast)',
    },
    section: {
        marginBottom: '20px',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '1.1rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '16px',
        textTransform: 'capitalize',
    },
    toolsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px',
    },
    toolCard: {
        padding: '18px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        animation: 'fadeIn 0.3s ease-out both',
        transition: 'all var(--transition-fast)',
    },
    toolHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
        flexWrap: 'wrap',
        gap: '6px',
    },
    toolName: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        fontFamily: 'monospace',
    },
    riskBadge: {
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.68rem',
        fontWeight: 600,
    },
    toolDesc: {
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        marginBottom: '4px',
    },
    toolDescHi: {
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-hindi)',
        marginBottom: '8px',
    },
    toolMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    toolCategory: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textTransform: 'capitalize',
    },
};
