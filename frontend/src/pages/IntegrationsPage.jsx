import React, { useState } from 'react';
import {
    MessageSquare, Brain, Wrench, Shield, Smartphone, Globe,
    Mail, FileText, Terminal, Cloud, Database, Zap,
    Check, X, ExternalLink, ChevronDown, ChevronUp,
    Search, Calculator, Bell, Calendar, CreditCard, Eye,
    Mic, Monitor, Wifi, WifiOff, Bot
} from 'lucide-react';

const integrationCategories = [
    {
        id: 'chat',
        title: '⟩ Chat Providers',
        subtitle: 'Message SamarthyaBot from any chat app — it responds right where you are.',
        items: [
            { name: 'WhatsApp', nameHi: 'व्हाट्सएप', icon: '📱', desc: 'WhatsApp Business Cloud API', status: 'live', tag: '🇮🇳 #1 in India' },
            { name: 'Telegram', nameHi: 'टेलीग्राम', icon: '✈️', desc: 'Bot API integration', status: 'live', tag: 'Active' },
            { name: 'WebChat', nameHi: 'वेबचैट', icon: '💬', desc: 'Browser-based UI (this app)', status: 'live', tag: '' },
            { name: 'Discord', nameHi: 'डिस्कॉर्ड', icon: '🎮', desc: 'Servers, channels & DMs', status: 'coming', tag: '' },
            { name: 'Slack', nameHi: 'स्लैक', icon: '💼', desc: 'Workspace integration', status: 'coming', tag: '' },
            { name: 'Signal', nameHi: 'सिग्नल', icon: '🔒', desc: 'Privacy-focused messaging', status: 'planned', tag: '' },
        ]
    },
    {
        id: 'ai',
        title: '⟩ AI Models',
        subtitle: 'Use any model you want — cloud or local. Your keys, your choice.',
        items: [
            { name: 'Google Gemini', nameHi: 'गूगल जेमिनी', icon: '✨', desc: 'Gemini 2.5 Flash (Default)', status: 'live', tag: 'Default' },
            { name: 'Ollama (Local)', nameHi: 'ऑलामा', icon: '🏠', desc: 'dolphin3:8b — offline mode', status: 'live', tag: 'Offline' },
            { name: 'OpenAI', nameHi: 'ओपनएआई', icon: '🤖', desc: 'GPT-4o, GPT-5', status: 'coming', tag: '' },
            { name: 'Anthropic', nameHi: 'एंथ्रोपिक', icon: '🧠', desc: 'Claude 4 Opus', status: 'planned', tag: '' },
            { name: 'DeepSeek', nameHi: 'डीपसीक', icon: '🔍', desc: 'DeepSeek V3 & R1', status: 'planned', tag: '' },
            { name: 'Gemini Vision', nameHi: 'जेमिनी विज़न', icon: '👁️', desc: 'Screen Understanding', status: 'live', tag: 'Vision' },
        ]
    },
    {
        id: 'tools',
        title: '⟩ Real Tools & Automation',
        subtitle: 'Not simulations — these actually work. Files, emails, commands, and more.',
        items: [
            { name: 'Email (Gmail)', nameHi: 'ईमेल', icon: '📧', desc: 'Real email via Nodemailer SMTP', status: 'live', tag: 'Real' },
            { name: 'File System', nameHi: 'फाइल सिस्टम', icon: '📁', desc: 'Read/write/list files (sandboxed)', status: 'live', tag: 'Real' },
            { name: 'Shell Commands', nameHi: 'शेल कमांड', icon: '💻', desc: 'Safe command execution (whitelisted)', status: 'live', tag: 'Real' },
            { name: 'Web Search', nameHi: 'वेब सर्च', icon: '🔍', desc: 'DuckDuckGo instant search', status: 'live', tag: 'Real' },
            { name: 'Weather', nameHi: 'मौसम', icon: '🌤️', desc: 'Open-Meteo (free, no API key)', status: 'live', tag: 'Real' },
            { name: 'Calculator', nameHi: 'कैलकुलेटर', icon: '🧮', desc: 'Math + GST calculations', status: 'live', tag: 'Real' },
            { name: 'System Info', nameHi: 'सिस्टम जानकारी', icon: '🖥️', desc: 'CPU, RAM, OS info', status: 'live', tag: 'Real' },
            { name: 'Browser Open', nameHi: 'ब्राउज़र', icon: '🌐', desc: 'Open URLs in default browser', status: 'live', tag: 'Real' },
            { name: 'Notes', nameHi: 'नोट्स', icon: '📝', desc: 'Save notes as Markdown files', status: 'live', tag: 'Real' },
            { name: 'Reminders', nameHi: 'रिमाइंडर', icon: '⏰', desc: 'Persistent JSON reminders', status: 'live', tag: 'Real' },
            { name: 'Calendar', nameHi: 'कैलेंडर', icon: '📅', desc: 'Event scheduling (local files)', status: 'live', tag: 'Real' },
        ]
    },
    {
        id: 'india',
        title: '⟩ Indian Workflows',
        subtitle: 'Built specifically for Indian users — GST, UPI, IRCTC, and more.',
        items: [
            { name: 'UPI Payments', nameHi: 'यूपीआई', icon: '💳', desc: 'Generate real UPI deep links', status: 'live', tag: '🇮🇳 Real' },
            { name: 'GST Reminders', nameHi: 'जीएसटी', icon: '🏢', desc: 'GSTR-1, 3B, 9 deadline tracking', status: 'live', tag: '🇮🇳 Real' },
            { name: 'IRCTC Helper', nameHi: 'आईआरसीटीसी', icon: '🚂', desc: 'Screen Understanding for booking', status: 'live', tag: 'Vision' },
            { name: 'PAN/Aadhaar Masking', nameHi: 'पैन/आधार', icon: '🔐', desc: 'Auto-detect & mask sensitive data', status: 'live', tag: 'Security' },
            { name: 'DigiLocker', nameHi: 'डिजीलॉकर', icon: '📋', desc: 'Screen Understanding support', status: 'live', tag: 'Vision' },
            { name: 'Hindi/Hinglish', nameHi: 'हिंदी/हिंग्लिश', icon: '🗣️', desc: '3 language support with auto-detect', status: 'live', tag: '🇮🇳' },
        ]
    },
    {
        id: 'voice',
        title: '⟩ Voice & Vision',
        subtitle: 'Talk to SamarthyaBot, send screenshots — it understands everything.',
        items: [
            { name: 'Voice Input', nameHi: 'वॉइस इनपुट', icon: '🎙️', desc: 'Web Speech API (Hindi/English)', status: 'live', tag: 'Real' },
            { name: 'Text-to-Speech', nameHi: 'टेक्स्ट-टू-स्पीच', icon: '🔊', desc: 'Bot reads responses aloud', status: 'live', tag: 'Real' },
            { name: 'Screen Capture', nameHi: 'स्क्रीन कैप्चर', icon: '📸', desc: 'Upload screenshots for AI analysis', status: 'live', tag: 'Vision' },
            { name: 'Whisper (Local)', nameHi: 'व्हिस्पर', icon: '🎧', desc: 'Offline voice-to-text', status: 'planned', tag: '' },
        ]
    },
    {
        id: 'security',
        title: '⟩ Privacy & Security',
        subtitle: 'Your data stays yours. Privacy-first, always.',
        items: [
            { name: 'Sensitive Data Detection', nameHi: 'सेंसिटिव डेटा', icon: '🛡️', desc: 'PAN, Aadhaar, bank auto-detect', status: 'live', tag: 'Always On' },
            { name: 'Permission System', nameHi: 'अनुमति सिस्टम', icon: '🔑', desc: 'Ask before file/email/browser access', status: 'live', tag: '' },
            { name: 'Audit Log', nameHi: 'ऑडिट लॉग', icon: '📊', desc: 'Full tool execution history', status: 'live', tag: '' },
            { name: 'Sandbox Mode', nameHi: 'सैंडबॉक्स', icon: '📦', desc: 'Files restricted to ~/SamarthyaBot_Files', status: 'live', tag: '' },
            { name: 'Local-First', nameHi: 'लोकल-फर्स्ट', icon: '🏠', desc: 'Ollama for offline private AI', status: 'live', tag: '' },
        ]
    }
];

const statusColors = {
    live: { bg: 'rgba(19, 136, 8, 0.2)', color: '#4ade80', label: '✅ Live' },
    coming: { bg: 'rgba(255, 153, 51, 0.2)', color: '#FF9933', label: '🔜 Coming Soon' },
    planned: { bg: 'rgba(100, 100, 100, 0.2)', color: '#888', label: '📋 Planned' }
};

export default function IntegrationsPage({ user }) {
    const [expandedCats, setExpandedCats] = useState(
        integrationCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
    );
    const [filter, setFilter] = useState('all'); // all, live, coming

    const toggleCategory = (id) => {
        setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredCategories = integrationCategories.map(cat => ({
        ...cat,
        items: filter === 'all' ? cat.items : cat.items.filter(i => i.status === filter)
    })).filter(cat => cat.items.length > 0);

    const totalLive = integrationCategories.flatMap(c => c.items).filter(i => i.status === 'live').length;
    const totalComing = integrationCategories.flatMap(c => c.items).filter(i => i.status === 'coming').length;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <Zap size={28} color="#FF9933" />
                    Integrations
                </h1>
                <p style={styles.subtitle}>
                    <span style={styles.countBadge}>{totalLive}</span> live integrations with real tools & services.
                    <br />
                    Chat from WhatsApp, control files, send emails, check weather — all from one AI.
                </p>
            </div>

            {/* Filter Tabs */}
            <div style={styles.filterBar}>
                {[
                    { key: 'all', label: `All (${totalLive + totalComing})` },
                    { key: 'live', label: `✅ Live (${totalLive})` },
                    { key: 'coming', label: `🔜 Coming (${totalComing})` }
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        style={{
                            ...styles.filterBtn,
                            ...(filter === f.key ? styles.filterBtnActive : {})
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Categories */}
            {filteredCategories.map(cat => (
                <div key={cat.id} style={styles.category}>
                    <button
                        onClick={() => toggleCategory(cat.id)}
                        style={styles.categoryHeader}
                    >
                        <div>
                            <h2 style={styles.categoryTitle}>{cat.title}</h2>
                            <p style={styles.categorySubtitle}>{cat.subtitle}</p>
                        </div>
                        {expandedCats[cat.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {expandedCats[cat.id] && (
                        <div style={styles.grid}>
                            {cat.items.map((item, i) => {
                                const status = statusColors[item.status];
                                return (
                                    <div key={i} style={styles.card}>
                                        <div style={styles.cardTop}>
                                            <span style={styles.cardIcon}>{item.icon}</span>
                                            <div style={styles.cardInfo}>
                                                <h3 style={styles.cardName}>{item.name}</h3>
                                                <p style={styles.cardNameHi}>{item.nameHi}</p>
                                            </div>
                                            {item.tag && (
                                                <span style={{
                                                    ...styles.tag,
                                                    background: item.tag.includes('Real') ? 'rgba(19,136,8,0.3)' :
                                                        item.tag.includes('🇮🇳') ? 'rgba(255,153,51,0.2)' :
                                                            'rgba(100,100,200,0.2)',
                                                    color: item.tag.includes('Real') ? '#4ade80' :
                                                        item.tag.includes('🇮🇳') ? '#FF9933' : '#a0a0ff'
                                                }}>
                                                    {item.tag}
                                                </span>
                                            )}
                                        </div>
                                        <p style={styles.cardDesc}>{item.desc}</p>
                                        <div style={{
                                            ...styles.statusBadge,
                                            background: status.bg,
                                            color: status.color
                                        }}>
                                            {status.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}

            {/* Footer CTA */}
            <div style={styles.footerCTA}>
                <h2 style={styles.ctaTitle}>🔧 Want to add more integrations?</h2>
                <p style={styles.ctaText}>
                    SamarthyaBot is open-source. Add your own tools in <code style={styles.code}>toolRegistry.js</code>
                </p>
                <div style={styles.ctaButtons}>
                    <div style={styles.ctaCard}>
                        <span style={styles.ctaIcon}>📧</span>
                        <strong>Email Setup</strong>
                        <p style={styles.ctaSmall}>Add Gmail App Password to .env</p>
                    </div>
                    <div style={styles.ctaCard}>
                        <span style={styles.ctaIcon}>📱</span>
                        <strong>WhatsApp Setup</strong>
                        <p style={styles.ctaSmall}>Meta Business API token</p>
                    </div>
                    <div style={styles.ctaCard}>
                        <span style={styles.ctaIcon}>🏠</span>
                        <strong>Offline Mode</strong>
                        <p style={styles.ctaSmall}>Set USE_OLLAMA=true in .env</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '12px',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: '15px',
        lineHeight: '1.6',
    },
    countBadge: {
        background: 'linear-gradient(135deg, #FF9933, #FF6600)',
        color: '#fff',
        padding: '2px 10px',
        borderRadius: '20px',
        fontWeight: '700',
        fontSize: '14px',
    },
    filterBar: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginBottom: '24px',
    },
    filterBtn: {
        padding: '8px 20px',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        background: 'transparent',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '13px',
        transition: 'all 0.2s',
    },
    filterBtnActive: {
        background: 'rgba(255, 153, 51, 0.15)',
        borderColor: '#FF9933',
        color: '#FF9933',
    },
    category: {
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.02)',
    },
    categoryHeader: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.03)',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        textAlign: 'left',
    },
    categoryTitle: {
        fontSize: '18px',
        fontWeight: '600',
        margin: 0,
        color: '#FF9933',
    },
    categorySubtitle: {
        fontSize: '13px',
        color: '#64748b',
        margin: '4px 0 0',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px',
        padding: '16px 20px',
    },
    card: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '14px',
        transition: 'all 0.2s',
    },
    cardTop: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '8px',
    },
    cardIcon: {
        fontSize: '24px',
    },
    cardInfo: {
        flex: 1,
    },
    cardName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#e2e8f0',
        margin: 0,
    },
    cardNameHi: {
        fontSize: '11px',
        color: '#64748b',
        margin: 0,
    },
    tag: {
        fontSize: '10px',
        padding: '2px 8px',
        borderRadius: '10px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    cardDesc: {
        fontSize: '12px',
        color: '#94a3b8',
        margin: '0 0 8px',
        lineHeight: '1.4',
    },
    statusBadge: {
        display: 'inline-block',
        fontSize: '11px',
        padding: '3px 10px',
        borderRadius: '12px',
        fontWeight: '500',
    },
    footerCTA: {
        textAlign: 'center',
        padding: '32px 20px',
        marginTop: '24px',
        background: 'linear-gradient(135deg, rgba(255,153,51,0.05), rgba(0,0,128,0.05))',
        borderRadius: '16px',
        border: '1px solid rgba(255,153,51,0.15)',
    },
    ctaTitle: {
        fontSize: '20px',
        color: '#fff',
        margin: '0 0 8px',
    },
    ctaText: {
        color: '#94a3b8',
        fontSize: '14px',
        marginBottom: '20px',
    },
    code: {
        background: 'rgba(255,153,51,0.15)',
        padding: '2px 6px',
        borderRadius: '4px',
        color: '#FF9933',
        fontSize: '13px',
    },
    ctaButtons: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    ctaCard: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '14px 20px',
        textAlign: 'center',
        color: '#e2e8f0',
        fontSize: '14px',
        minWidth: '160px',
    },
    ctaIcon: {
        fontSize: '24px',
        display: 'block',
        marginBottom: '6px',
    },
    ctaSmall: {
        fontSize: '11px',
        color: '#64748b',
        margin: '4px 0 0',
    }
};
