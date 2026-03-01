import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Eye, EyeOff, Sparkles, Globe, Shield, Zap } from 'lucide-react';

const features = [
    { icon: '🇮🇳', title: 'Made for India', titleHi: 'भारत के लिए बना', desc: 'Hindi, Hinglish & English support' },
    { icon: '🔐', title: 'Privacy First', titleHi: 'प्राइवेसी पहले', desc: 'PAN/Aadhaar detection & masking' },
    { icon: '🛠️', title: 'Smart Tools', titleHi: 'स्मार्ट टूल्स', desc: 'GST, UPI, Calendar & more' },
    { icon: '🧠', title: 'Memory', titleHi: 'याददाश्त', desc: 'Remembers your preferences' },
];

export default function LoginPage({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', language: 'hinglish', city: '', workType: 'personal'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = isRegister
                ? await authAPI.register(formData)
                : await authAPI.login({ email: formData.email, password: formData.password });

            onLogin(res.data.user, res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await authAPI.demoLogin();
            onLogin(res.data.user, res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Demo login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Background effects */}
            <div style={styles.bgOrb1} />
            <div style={styles.bgOrb2} />
            <div style={styles.bgOrb3} />

            <div style={styles.content}>
                {/* Left: Branding */}
                <div style={styles.left}>
                    <div style={styles.logo}>
                        <span style={styles.logoIcon}>भ</span>
                        <div>
                            <h1 style={styles.logoText}>SamarthyaBot</h1>
                            <p style={styles.logoSub}>समर्थ्य बोट</p>
                        </div>
                    </div>

                    <h2 style={styles.tagline}>
                        Privacy-first Personal AI Operator
                        <br />
                        <span style={styles.taglineHi}>भारतीय कार्यप्रवाह के लिए बनाया गया</span>
                    </h2>

                    <div style={styles.features}>
                        {features.map((f, i) => (
                            <div key={i} style={{ ...styles.featureCard, animationDelay: `${i * 0.1}s` }}>
                                <span style={styles.featureIcon}>{f.icon}</span>
                                <div>
                                    <div style={styles.featureTitle}>{f.title}</div>
                                    <div style={styles.featureDesc}>{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Form */}
                <div style={styles.right}>
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>
                            {isRegister ? 'Create Account' : 'Welcome Back'} ✨
                        </h3>
                        <p style={styles.formSubtitle}>
                            {isRegister ? 'Start your AI journey' : 'Login to continue your AI journey'}
                        </p>

                        {error && <div style={styles.error}>{error}</div>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            {isRegister && (
                                <div style={styles.field}>
                                    <label style={styles.label}>Name</label>
                                    <input
                                        style={styles.input}
                                        type="text"
                                        placeholder="Aapka naam"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            <div style={styles.field}>
                                <label style={styles.label}>Email</label>
                                <input
                                    style={styles.input}
                                    type="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Password</label>
                                <div style={styles.passwordWrap}>
                                    <input
                                        style={{ ...styles.input, paddingRight: '44px' }}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.eyeBtn}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {isRegister && (
                                <>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Language / भाषा</label>
                                        <select
                                            style={styles.input}
                                            value={formData.language}
                                            onChange={e => setFormData({ ...formData, language: e.target.value })}
                                        >
                                            <option value="hinglish">Hinglish (Hindi + English)</option>
                                            <option value="hindi">हिंदी (Hindi)</option>
                                            <option value="english">English</option>
                                        </select>
                                    </div>

                                    <div style={styles.row}>
                                        <div style={{ ...styles.field, flex: 1 }}>
                                            <label style={styles.label}>City / शहर</label>
                                            <input
                                                style={styles.input}
                                                type="text"
                                                placeholder="Mumbai"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ ...styles.field, flex: 1 }}>
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
                                </>
                            )}

                            <button
                                type="submit"
                                style={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span style={styles.spinner} />
                                ) : (
                                    <>
                                        {isRegister ? 'Create Account' : 'Login'} <Zap size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={styles.divider}>
                            <span>or</span>
                        </div>

                        <button onClick={handleDemoLogin} style={styles.demoBtn} disabled={loading}>
                            <Sparkles size={16} /> Quick Demo Login
                        </button>

                        <p style={styles.switchText}>
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                                style={styles.switchBtn}
                            >
                                {isRegister ? 'Login' : 'Register'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
    },
    bgOrb1: {
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        top: '-200px',
        right: '-100px',
        animation: 'float 8s ease-in-out infinite',
    },
    bgOrb2: {
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)',
        bottom: '-150px',
        left: '-100px',
        animation: 'float 10s ease-in-out infinite reverse',
    },
    bgOrb3: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(19,136,8,0.08) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'float 12s ease-in-out infinite',
    },
    content: {
        display: 'flex',
        gap: '60px',
        maxWidth: '1100px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    left: {
        flex: '1',
        minWidth: '340px',
        maxWidth: '480px',
        animation: 'fadeInUp 0.6s ease-out',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '32px',
    },
    logoIcon: {
        fontSize: '2.8rem',
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'var(--font-hindi)',
        fontWeight: 700,
    },
    logoText: {
        fontSize: '2rem',
        fontWeight: 800,
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1.1,
    },
    logoSub: {
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-hindi)',
    },
    tagline: {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        lineHeight: 1.5,
        marginBottom: '36px',
    },
    taglineHi: {
        fontSize: '1.1rem',
        fontWeight: 400,
        color: 'var(--accent-saffron)',
        fontFamily: 'var(--font-hindi)',
    },
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    featureCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 18px',
        background: 'rgba(26, 26, 62, 0.5)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        animation: 'fadeIn 0.4s ease-out both',
        transition: 'all var(--transition-normal)',
    },
    featureIcon: {
        fontSize: '1.5rem',
    },
    featureTitle: {
        fontWeight: 600,
        fontSize: '0.95rem',
        color: 'var(--text-primary)',
    },
    featureDesc: {
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
    },
    right: {
        flex: '1',
        minWidth: '340px',
        maxWidth: '420px',
        animation: 'fadeInUp 0.6s ease-out 0.2s both',
    },
    formCard: {
        background: 'rgba(15, 15, 35, 0.8)',
        backdropFilter: 'blur(30px)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-lg)',
    },
    formTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '6px',
    },
    formSubtitle: {
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        marginBottom: '24px',
    },
    error: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#ef4444',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.85rem',
        marginBottom: '16px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
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
        padding: '12px 16px',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-primary)',
        fontSize: '0.9375rem',
        outline: 'none',
        transition: 'all 0.2s',
    },
    passwordWrap: {
        position: 'relative',
    },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '4px',
    },
    row: {
        display: 'flex',
        gap: '12px',
    },
    submitBtn: {
        width: '100%',
        padding: '14px',
        background: 'var(--gradient-primary)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s',
        boxShadow: 'var(--shadow-glow)',
        fontFamily: 'var(--font-primary)',
        marginTop: '8px',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '20px 0',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
    },
    demoBtn: {
        width: '100%',
        padding: '12px',
        background: 'var(--bg-card)',
        color: 'var(--accent-gold)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s',
        fontFamily: 'var(--font-primary)',
    },
    switchText: {
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        marginTop: '18px',
    },
    switchBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--accent-primary)',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-primary)',
    },
    spinner: {
        width: '20px',
        height: '20px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        display: 'inline-block',
    }
};
