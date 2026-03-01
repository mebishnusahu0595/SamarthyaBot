import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield, Zap, Clock, Check, ArrowRight,
    Github, Twitter, Terminal, Cpu, Lock, Layers
} from 'lucide-react';

const installationSteps = [
    { cmd: 'npm install -g samarthya-bot', desc: 'Install the global CLI tool' },
    { cmd: 'samarthya onboard', desc: 'Setup your local environment & keys' },
    { cmd: 'samarthya gateway', desc: 'Start the autonomous agent engine' }
];

const features = [
    {
        title: 'Completely Local',
        desc: 'Your data never leaves your machine. Use Ollama for 100% offline intelligence.',
        icon: <Shield size={24} />
    },
    {
        title: 'Autonomous Planning',
        desc: 'The agent breaks complex tasks into steps and executes them independently.',
        icon: <Zap size={24} />
    },
    {
        title: 'Extensible Tools',
        desc: 'Built-in support for Web Search, IRCTC, GST, OS control, and custom plugins.',
        icon: <Layers size={24} />
    }
];

export default function HomePage() {
    const [typedText, setTypedText] = useState('');
    const [heroTextIdx, setHeroTextIdx] = useState(0);
    const heroTexts = ['samarthya onboard', 'samarthya model', 'samarthya gateway'];

    useEffect(() => {
        const text = heroTexts[heroTextIdx];
        let i = 0;
        setTypedText('');
        const typeInterval = setInterval(() => {
            if (i <= text.length) {
                setTypedText(text.substring(0, i));
                i++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    setHeroTextIdx((prev) => (prev + 1) % heroTexts.length);
                }, 2000);
            }
        }, 80);
        return () => clearInterval(typeInterval);
    }, [heroTextIdx]);

    return (
        <div style={styles.page}>
            <nav style={styles.nav}>
                <div style={styles.navInner}>
                    <div style={styles.navBrand}>
                        <div style={styles.logoWrap}>स</div>
                        <span style={styles.navName}>SamarthyaBot</span>
                    </div>
                    <div style={styles.navLinks}>
                        <a href="#features" style={styles.navLink}>Features</a>
                        <a href="#installation" style={styles.navLink}>Installation</a>
                        <Link to="/dashboard" style={styles.navCta}>
                            Launch Dashboard <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>

            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <div style={styles.heroBadge}>
                        <span style={styles.heroBadgeDot} />
                        v1.0.1 Stable — The Local-First Agentic OS
                    </div>
                    <h1 style={styles.heroTitle}>
                        Turn Your Machine into an
                        <br />
                        <span style={styles.heroTitleAccent}>Autonomous AI Hub</span>
                    </h1>
                    <p style={styles.heroSubtitle}>
                        Privacy-first AI agent platform. No subscription. No data tracking.
                        <br />Run multi-step workflows natively on your own hardware.
                    </p>

                    <div style={styles.terminal}>
                        <div style={styles.terminalHeader}>
                            <div style={styles.terminalDots}>
                                <div style={{ ...styles.dot, background: '#ff5f56' }} />
                                <div style={{ ...styles.dot, background: '#ffbd2e' }} />
                                <div style={{ ...styles.dot, background: '#27c93f' }} />
                            </div>
                            <span style={styles.terminalTitle}>bash — samarthya-cli</span>
                        </div>
                        <div style={styles.terminalBody}>
                            <div style={styles.terminalLine}>
                                <span style={styles.prompt}>$</span>
                                <span style={styles.typedText}>{typedText}</span>
                                <span style={styles.cursor}>_</span>
                            </div>
                            <div style={styles.terminalOutput}>
                                {heroTextIdx === 0 && '> Initializing SamarthyaBot... Environment ready.'}
                                {heroTextIdx === 1 && '> Selected Provider: LOCAL OLLAMA (Llama-3).'}
                                {heroTextIdx === 2 && '> Gateway online at http://localhost:5000. Engine ACTIVE.'}
                            </div>
                        </div>
                    </div>

                    <div style={styles.heroCtas}>
                        <Link to="/dashboard" style={styles.heroBtn}>
                            Enter Admin Console <Zap size={18} />
                        </Link>
                        <a href="https://github.com/mebishnusahu0595/SamarthyaBot" target="_blank" rel="noreferrer" style={styles.heroBtn2}>
                            <Github size={18} /> View on GitHub
                        </a>
                    </div>
                </div>
            </section>

            <section id="features" style={styles.section}>
                <div style={styles.sectionInner}>
                    <h2 style={styles.sectionTitle}>Built for Privacy & Power</h2>
                    <p style={styles.sectionSubtitle}>Open source features that make SamarthyaBot elite.</p>
                    <div style={styles.featureGrid}>
                        {features.map((f, i) => (
                            <div key={i} style={styles.featureCard}>
                                <div style={styles.featureIcon}>{f.icon}</div>
                                <h3 style={styles.featureName}>{f.title}</h3>
                                <p style={styles.featureDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="installation" style={styles.sectionAlt}>
                <div style={styles.sectionInner}>
                    <h2 style={styles.sectionTitle}>Get Started in 30 Seconds</h2>
                    <p style={styles.sectionSubtitle}>No installers. Just pure NPM power.</p>
                    <div style={styles.installBox}>
                        {installationSteps.map((s, i) => (
                            <div key={i} style={styles.stepRow}>
                                <div style={styles.stepNum}>{i + 1}</div>
                                <div style={styles.stepContent}>
                                    <code style={styles.stepCode}>{s.cmd}</code>
                                    <p style={styles.stepDesc}>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer style={styles.footer}>
                <div style={styles.footerInner}>
                    <div style={styles.footerBrand}>
                        <div style={styles.logoWrapSmall}>स</div>
                        <span>SamarthyaBot — MIT Licensed</span>
                    </div>
                    <div style={styles.socials}>
                        <a href="https://github.com/mebishnusahu0595/SamarthyaBot" style={styles.socialLink}><Github size={20} /></a>
                        <a href="#" style={styles.socialLink}><Twitter size={20} /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const styles = {
    page: {
        background: '#0a0a0f',
        color: '#ffffff',
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
    },
    nav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        zIndex: 1000,
    },
    navInner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navBrand: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logoWrap: {
        width: '32px',
        height: '32px',
        background: 'linear-gradient(135deg, #FF9933, #138808)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#000',
        fontFamily: "'Noto Sans Devanagari', sans-serif",
    },
    navName: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        letterSpacing: '-0.5px',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
    },
    navLink: {
        color: '#a0a0a0',
        textDecoration: 'none',
        fontSize: '0.9rem',
        transition: 'color 0.2s',
    },
    navCta: {
        background: '#ffffff',
        color: '#000000',
        padding: '8px 20px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'transform 0.2s',
    },
    hero: {
        padding: '160px 24px 100px',
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
    },
    heroContent: {
        maxWidth: '800px',
    },
    heroBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255, 153, 51, 0.1)',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        color: '#FF9933',
        marginBottom: '24px',
        border: '1px solid rgba(255, 153, 51, 0.2)',
    },
    heroBadgeDot: {
        width: '6px',
        height: '6px',
        background: '#27c93f',
        borderRadius: '50%',
        boxShadow: '0 0 10px #27c93f',
    },
    heroTitle: {
        fontSize: '4.5rem',
        fontWeight: '800',
        lineHeight: '1',
        marginBottom: '24px',
        letterSpacing: '-2px',
    },
    heroTitleAccent: {
        background: 'linear-gradient(135deg, #FF9933, #ffffff, #138808)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        color: '#a0a0a0',
        lineHeight: '1.6',
        marginBottom: '40px',
    },
    terminal: {
        background: '#151520',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        textAlign: 'left',
        margin: '0 auto 40px',
        maxWidth: '600px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    },
    terminalHeader: {
        background: '#1c1c28',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    terminalDots: {
        display: 'flex',
        gap: '6px',
    },
    dot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
    },
    terminalTitle: {
        fontSize: '0.7rem',
        color: '#606060',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    terminalBody: {
        padding: '24px',
        fontFamily: "'Fira Code', 'Courier New', monospace",
        fontSize: '0.9rem',
        minHeight: '120px',
    },
    terminalLine: {
        display: 'flex',
        gap: '12px',
        marginBottom: '12px',
    },
    prompt: {
        color: '#27c93f',
    },
    typedText: {
        color: '#ffffff',
    },
    cursor: {
        color: '#FF9933',
        animation: 'blink 1s step-end infinite',
    },
    terminalOutput: {
        color: '#606060',
        fontSize: '0.8rem',
    },
    heroCtas: {
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
    },
    heroBtn: {
        background: '#ff9933',
        color: '#000',
        padding: '14px 28px',
        borderRadius: '10px',
        textDecoration: 'none',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    heroBtn2: {
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#fff',
        padding: '14px 28px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textDecoration: 'none',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    section: {
        padding: '100px 24px',
        textAlign: 'center',
    },
    sectionAlt: {
        padding: '100px 24px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
    },
    sectionInner: {
        maxWidth: '1000px',
        margin: '0 auto',
    },
    sectionTitle: {
        fontSize: '3rem',
        fontWeight: '800',
        marginBottom: '16px',
    },
    sectionSubtitle: {
        fontSize: '1.1rem',
        color: '#a0a0a0',
        marginBottom: '60px',
    },
    featureGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
    },
    featureCard: {
        background: '#12121e',
        padding: '40px 32px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center',
        transition: 'transform 0.3s',
    },
    featureIcon: {
        width: '56px',
        height: '56px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FF9933',
        margin: '0 auto 24px',
    },
    featureName: {
        fontSize: '1.25rem',
        fontWeight: '700',
        marginBottom: '12px',
    },
    featureDesc: {
        fontSize: '0.9rem',
        color: '#808080',
        lineHeight: '1.6',
    },
    installBox: {
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'left',
    },
    stepRow: {
        display: 'flex',
        gap: '24px',
        marginBottom: '32px',
    },
    stepNum: {
        width: '32px',
        height: '32px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: '#FF9933',
        flexShrink: 0,
    },
    stepContent: {
        flex: 1,
    },
    stepCode: {
        display: 'block',
        background: '#000',
        padding: '12px 16px',
        borderRadius: '8px',
        fontFamily: "'Fira Code', monospace",
        color: '#27c93f',
        fontSize: '0.9rem',
        marginBottom: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    stepDesc: {
        fontSize: '0.85rem',
        color: '#a0a0a0',
    },
    footer: {
        padding: '60px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    },
    footerInner: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerBrand: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.85rem',
        color: '#606060',
    },
    logoWrapSmall: {
        width: '24px',
        height: '24px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#808080',
        fontFamily: "'Noto Sans Devanagari', sans-serif",
    },
    socials: {
        display: 'flex',
        gap: '20px',
    },
    socialLink: {
        color: '#606060',
        transition: 'color 0.2s',
    }
};
