import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Save, User, Globe, Shield, Bell, Palette, Check } from 'lucide-react';

export default function SettingsPage({ user, onUpdate }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        language: user?.language || 'hinglish',
        city: user?.city || '',
        workType: user?.workType || 'personal',
        activePack: user?.activePack || 'personal',
        permissions: user?.permissions || {
            fileAccess: 'ask',
            emailAccess: 'ask',
            browserAccess: 'ask',
            calendarAccess: 'ask',
        }
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await authAPI.updateProfile(formData);
            onUpdate(res.data.user);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save failed');
        } finally {
            setSaving(false);
        }
    };

    const permOptions = [
        { value: 'ask', label: '🔔 Ask Every Time', labelHi: 'हर बार पूछो' },
        { value: 'allow_always', label: '✅ Always Allow', labelHi: 'हमेशा अनुमति' },
        { value: 'allow_once', label: '☑️ Allow Once', labelHi: 'एक बार अनुमति' },
        { value: 'never', label: '🚫 Never Allow', labelHi: 'कभी नहीं' },
    ];

    const permissionItems = [
        { key: 'fileAccess', label: 'File Access', labelHi: 'फ़ाइल एक्सेस', icon: '📁', desc: 'Read, write, and delete files on your system' },
        { key: 'emailAccess', label: 'Email Access', labelHi: 'ईमेल एक्सेस', icon: '📧', desc: 'Send and read emails on your behalf' },
        { key: 'browserAccess', label: 'Browser Automation', labelHi: 'ब्राउज़र ऑटोमेशन', icon: '🌐', desc: 'Automate web browsing, form filling, scraping' },
        { key: 'calendarAccess', label: 'Calendar Access', labelHi: 'कैलेंडर एक्सेस', icon: '📅', desc: 'Schedule and manage calendar events' },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>⚙️ Settings</h1>
                <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
                    {saved ? <><Check size={18} /> Saved!</> : saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
            </div>

            <div style={styles.grid}>
                {/* Profile Section */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <User size={20} style={{ color: 'var(--accent-primary)' }} />
                        <h2 style={styles.sectionTitle}>Profile / प्रोफ़ाइल</h2>
                    </div>
                    <div style={styles.sectionBody}>
                        <div style={styles.field}>
                            <label style={styles.label}>Name / नाम</label>
                            <input
                                style={styles.input}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                            />
                        </div>
                        <div style={styles.fieldRow}>
                            <div style={styles.field}>
                                <label style={styles.label}>City / शहर</label>
                                <input
                                    style={styles.input}
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Mumbai, Delhi, etc."
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Work Type</label>
                                <select
                                    style={styles.input}
                                    value={formData.workType}
                                    onChange={e => setFormData({ ...formData, workType: e.target.value })}
                                >
                                    <option value="personal">🏠 Personal</option>
                                    <option value="student">🎓 Student</option>
                                    <option value="business">🏢 Business</option>
                                    <option value="developer">👨‍💻 Developer</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Language Section */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <Globe size={20} style={{ color: 'var(--accent-saffron)' }} />
                        <h2 style={styles.sectionTitle}>Language / भाषा</h2>
                    </div>
                    <div style={styles.sectionBody}>
                        <div style={styles.langOptions}>
                            {[
                                { value: 'hinglish', label: 'Hinglish', desc: 'Hindi + English mix', icon: '🗣️' },
                                { value: 'hindi', label: 'हिंदी', desc: 'Pure Hindi responses', icon: '🇮🇳' },
                                { value: 'english', label: 'English', desc: 'English only', icon: '🌍' },
                            ].map(lang => (
                                <button
                                    key={lang.value}
                                    onClick={() => setFormData({ ...formData, language: lang.value })}
                                    style={{
                                        ...styles.langCard,
                                        ...(formData.language === lang.value ? styles.langCardActive : {})
                                    }}
                                >
                                    <span style={styles.langIcon}>{lang.icon}</span>
                                    <span style={styles.langLabel}>{lang.label}</span>
                                    <span style={styles.langDesc}>{lang.desc}</span>
                                    {formData.language === lang.value && <Check size={16} style={styles.langCheck} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tool Pack Section */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <Shield size={20} style={{ color: 'var(--accent-teal)' }} />
                        <h2 style={styles.sectionTitle}>Active Pack / टूल पैक</h2>
                    </div>
                    <div style={styles.sectionBody}>
                        <div style={styles.packGrid}>
                            {[
                                { id: 'personal', icon: '🏠', name: 'Personal', desc: 'Bills, files, reminders' },
                                { id: 'student', icon: '🎓', name: 'Student', desc: 'Study, notes, exams' },
                                { id: 'business', icon: '🏢', name: 'Business', desc: 'GST, invoices, email' },
                                { id: 'developer', icon: '👨‍💻', name: 'Developer', desc: 'Code, logs, GitHub' },
                            ].map(pack => (
                                <button
                                    key={pack.id}
                                    onClick={() => setFormData({ ...formData, activePack: pack.id })}
                                    style={{
                                        ...styles.packCard,
                                        ...(formData.activePack === pack.id ? styles.packCardActive : {})
                                    }}
                                >
                                    <span style={styles.packIcon}>{pack.icon}</span>
                                    <span style={styles.packName}>{pack.name}</span>
                                    <span style={styles.packDesc}>{pack.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Permissions Section */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <Shield size={20} style={{ color: 'var(--accent-rose)' }} />
                        <h2 style={styles.sectionTitle}>Permissions / अनुमतियाँ</h2>
                    </div>
                    <div style={styles.sectionBody}>
                        {permissionItems.map(perm => (
                            <div key={perm.key} style={styles.permRow}>
                                <div style={styles.permInfo}>
                                    <span style={styles.permIcon}>{perm.icon}</span>
                                    <div>
                                        <div style={styles.permLabel}>{perm.label}</div>
                                        <div style={styles.permDesc}>{perm.desc}</div>
                                    </div>
                                </div>
                                <select
                                    style={styles.permSelect}
                                    value={formData.permissions[perm.key]}
                                    onChange={e => setFormData({
                                        ...formData,
                                        permissions: { ...formData.permissions, [perm.key]: e.target.value }
                                    })}
                                >
                                    {permOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
    },
    title: {
        fontSize: '1.6rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 22px',
        background: 'var(--gradient-primary)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-primary)',
        boxShadow: 'var(--shadow-glow)',
        transition: 'all var(--transition-normal)',
    },
    grid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    section: {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '18px 22px',
        borderBottom: '1px solid var(--border-subtle)',
    },
    sectionTitle: {
        fontSize: '1.05rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
    },
    sectionBody: {
        padding: '22px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginBottom: '16px',
        flex: 1,
    },
    fieldRow: {
        display: 'flex',
        gap: '16px',
    },
    label: {
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    input: {
        width: '100%',
        padding: '11px 16px',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-primary)',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'all 0.2s',
    },
    langOptions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
    },
    langCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '18px 14px',
        background: 'var(--bg-card)',
        border: '2px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        fontFamily: 'var(--font-primary)',
        position: 'relative',
        color: 'var(--text-primary)',
    },
    langCardActive: {
        borderColor: 'var(--accent-primary)',
        background: 'rgba(99, 102, 241, 0.08)',
    },
    langIcon: { fontSize: '1.5rem' },
    langLabel: { fontWeight: 600, fontSize: '0.9rem' },
    langDesc: { fontSize: '0.75rem', color: 'var(--text-muted)' },
    langCheck: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        color: 'var(--accent-primary)',
    },
    packGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
    },
    packCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '20px 14px',
        background: 'var(--bg-card)',
        border: '2px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        fontFamily: 'var(--font-primary)',
        color: 'var(--text-primary)',
    },
    packCardActive: {
        borderColor: 'var(--accent-primary)',
        background: 'rgba(99, 102, 241, 0.08)',
    },
    packIcon: { fontSize: '1.8rem' },
    packName: { fontWeight: 600, fontSize: '0.95rem' },
    packDesc: { fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' },
    permRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '16px',
    },
    permInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1,
    },
    permIcon: { fontSize: '1.3rem' },
    permLabel: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' },
    permDesc: { fontSize: '0.75rem', color: 'var(--text-muted)' },
    permSelect: {
        padding: '8px 12px',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-primary)',
        fontSize: '0.8rem',
        outline: 'none',
        minWidth: '170px',
    },
};
