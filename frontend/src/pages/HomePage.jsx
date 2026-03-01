import React, { useState, useEffect, useRef } from 'react';
import {
    Github, Terminal, Shield, Zap, MessageSquare, Cpu, Layers,
    Globe, Lock, ArrowRight, Command, ExternalLink, Play, Code,
    Search, Mail, FileText, Calendar, Eye, CheckCircle2, Database,
    Languages, Copy, Check, Sun, Moon, Server, Workflow, Bot, Star,
    Package, Key, RefreshCw, AlertTriangle, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─────────────────────────── DATA ─────────────────────────── */

const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'CLI', href: '#cli' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Security', href: '#security' },
];

const FEATURES = [
    {
        icon: <Workflow size={22} />,
        accent: '#FF9933',
        title: 'Autonomous Planning',
        desc: 'Native ReAct engine (Reason → Act → Observe) that breaks complex goals into discrete steps and executes them without holding your hand.',
    },
    {
        icon: <Shield size={22} />,
        accent: '#6ee7f7',
        title: 'Full Local Sovereignty',
        desc: 'Your data never leaves your machine. Use Ollama for 100% offline inference, or encrypted tunnels to cloud providers. You own the compute.',
    },
    {
        icon: <Database size={22} />,
        accent: '#a78bfa',
        title: 'Encrypted Memory Vault',
        desc: 'Every interaction stored locally. Sensitive data is encrypted via AES-256-CBC. Semantic vector search surfaces context across sessions.',
    },
    {
        icon: <Globe size={22} />,
        accent: '#138808',
        title: 'Indian Digital Highway',
        desc: "Native support for GST filings, IRCTC bookings, UPI payments, and Hinglish fluency. Built for India's digital infrastructure.",
    },
    {
        icon: <Package size={22} />,
        accent: '#fb923c',
        title: 'Plugin Extensibility',
        desc: 'Drop any JS file into the plugins folder and the assistant learns it instantly. Build custom automations for unique business logic.',
    },
    {
        icon: <Eye size={22} />,
        accent: '#f472b6',
        title: 'Visual Intelligence',
        desc: 'Built-in screen understanding for contextual automation. Let the agent see what you see and act on it autonomously.',
    },
];

const CLI_COMMANDS = [
    { cmd: 'samarthya onboard', desc: 'Start the installation & configuration wizard' },
    { cmd: 'samarthya gateway', desc: 'Run the backend control plane and serve the Dashboard' },
    { cmd: 'samarthya status', desc: 'Display the status of background jobs and the engine' },
    { cmd: 'samarthya stop', desc: 'Gracefully shut down all background autonomous agents' },
    { cmd: 'samarthya model [name]', desc: 'Swap between LLM providers (e.g. ollama, gemini)' },
];

const INTEGRATIONS = [
    { name: 'WhatsApp', emoji: '💬', bg: '#25D366', fg: '#fff' },
    { name: 'Telegram', emoji: '✈️',  bg: '#2AABEE', fg: '#fff' },
    { name: 'Gmail',    emoji: '📧', bg: '#EA4335', fg: '#fff' },
    { name: 'GitHub',   emoji: '🐙', bg: '#24292e', fg: '#fff' },
    { name: 'Discord',  emoji: '🎮', bg: '#5865F2', fg: '#fff' },
    { name: 'Slack',    emoji: '#',  bg: '#4A154B', fg: '#fff' },
    { name: 'UPI',      emoji: '₹',  bg: '#FF6600', fg: '#fff' },
    { name: 'IRCTC',    emoji: '🚂', bg: '#1565C0', fg: '#fff' },
];

const TESTIMONIALS = [
    {
        name: 'jonahships_', handle: '@jonahships_',
        text: 'Setup SamarthyaBot yesterday. All I have to say is, wow. The fact that it can just keep building upon itself just by talking to it is crazy.',
        initials: 'JS', avatarBg: '#FF9933',
    },
    {
        name: 'markjaquith', handle: '@markjaquith',
        text: 'SamarthyaBot feels like a "just had to glue all the parts together" leap forward. Incredible experience running locally.',
        initials: 'MJ', avatarBg: '#6ee7f7',
    },
    {
        name: 'danpeguine', handle: '@danpeguine',
        text: 'Your context and skills live on YOUR computer. Proactive AF: cron jobs, reminders, background tasks. Memory is amazing.',
        initials: 'DP', avatarBg: '#a78bfa',
    },
    {
        name: 'nateliason', handle: '@nateliason',
        text: 'Managing autonomous agent sessions I can kick off anywhere, running tests on my app and resolving them. The future of digital employees.',
        initials: 'NL', avatarBg: '#22c55e',
    },
];

const PLUGIN_SNIPPET = `// ~/SamarthyaBot_Files/plugins/hello.js
module.exports = {
  name: 'greet',
  description: 'Greets the user in a friendly way',
  parameters: {
    name: { type: 'string', required: true }
  },
  execute: async (args) => ({
    success: true,
    result: \`Namaste \${args.name}! Main SamarthyaBot hoon.\`
  })
};`;

/* ─────────────────────── SMALL COMPONENTS ─────────────────── */

function CopyButton({ text, dark }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} style={copyBtnStyle(dark)} aria-label="Copy to clipboard">
            {copied
                ? <Check size={15} color="#22c55e" />
                : <Copy size={15} color={dark ? '#666' : '#999'} />}
        </button>
    );
}

function SectionLabel({ children, dark }) {
    return (
        <div style={sectionLabelStyle()}>
            <span style={{ color: '#FF9933', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>
                {children}
            </span>
        </div>
    );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function HomePage() {
    const [dark, setDark] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const smoothScroll = (e, id) => {
        e.preventDefault();
        setMenuOpen(false);
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const bg = dark ? '#06060a' : '#ffffff';
    const surface = dark ? '#0e0e14' : '#f8f8fb';
    const border = dark ? '#1e1e28' : '#e8e8ee';
    const primary = dark ? '#ffffff' : '#0a0a0f';
    const secondary = dark ? '#8888a8' : '#555568';
    const muted = dark ? '#3a3a4e' : '#ccccdb';

    return (
        <>
            {/* ── Global Styles ── */}
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body { background: ${bg}; transition: background 0.3s; }
                a { text-decoration: none; color: inherit; }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes glow {
                    0%, 100% { opacity: 0.4; }
                    50%       { opacity: 0.8; }
                }
                @keyframes flagFlow {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .flag-text {
                    background: linear-gradient(90deg, #FF9933 0%, #ffffff 33%, #138808 66%, #FF9933 100%);
                    background-size: 300% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: flagFlow 6s ease infinite;
                }
                .fade-up   { animation: fadeUp 0.7s ease both; }
                .fade-up-d1 { animation: fadeUp 0.7s ease 0.1s both; }
                .fade-up-d2 { animation: fadeUp 0.7s ease 0.2s both; }
                .fade-up-d3 { animation: fadeUp 0.7s ease 0.3s both; }
                .fade-up-d4 { animation: fadeUp 0.7s ease 0.4s both; }
                .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .card-hover:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                }
                .nav-link {
                    font-size: 0.85rem; font-weight: 600; letter-spacing: 0.3px;
                    padding: 8px 14px; border-radius: 8px; transition: background 0.15s; cursor: pointer;
                }
                .nav-link:hover { background: ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}; }
                .btn-primary {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 12px 24px; border-radius: 10px; font-size: 0.9rem;
                    font-weight: 700; cursor: pointer;
                    background: linear-gradient(135deg, #FF9933 0%, #e8851d 100%);
                    color: #fff; border: none;
                    transition: transform 0.15s, box-shadow 0.15s;
                    box-shadow: 0 4px 20px rgba(255,153,51,0.35);
                }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(255,153,51,0.5); }
                .btn-secondary {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 12px 24px; border-radius: 10px; font-size: 0.9rem;
                    font-weight: 700; cursor: pointer; background: transparent;
                    color: ${primary}; border: 1.5px solid ${border};
                    transition: border-color 0.15s, background 0.15s;
                }
                .btn-secondary:hover {
                    border-color: ${dark ? '#3a3a4e' : '#aaaacc'};
                    background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
                }
                .mobile-menu {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 998;
                    background: ${dark ? 'rgba(6,6,10,0.97)' : 'rgba(255,255,255,0.97)'};
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; gap: 8px; backdrop-filter: blur(12px);
                }
                .mobile-menu-link {
                    font-size: 1.4rem; font-weight: 700; padding: 14px 32px;
                    color: ${primary}; border-radius: 12px; cursor: pointer; transition: background 0.15s;
                }
                .mobile-menu-link:hover { background: ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: ${bg}; }
                ::-webkit-scrollbar-thumb { background: ${muted}; border-radius: 99px; }
                @media (max-width: 900px) {
                    .feat-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .int-grid  { grid-template-columns: repeat(4, 1fr) !important; }
                    .arch-row  { flex-direction: column !important; }
                }
                @media (max-width: 640px) {
                    .hero-title    { font-size: clamp(2.4rem, 12vw, 3.5rem) !important; letter-spacing: -2px !important; }
                    .feat-grid     { grid-template-columns: 1fr !important; }
                    .spec-grid     { grid-template-columns: 1fr !important; }
                    .int-grid      { grid-template-columns: repeat(2, 1fr) !important; }
                    .test-grid     { grid-template-columns: 1fr !important; }
                    .footer-inner  { flex-direction: column; gap: 40px !important; }
                    .nav-desktop   { display: none !important; }
                    .hamburger     { display: flex !important; }
                    .hero-btns     { flex-direction: column !important; align-items: stretch !important; }
                    .hero-btns > * { text-align: center !important; justify-content: center; }
                    .plug-row      { flex-direction: column !important; }
                    .stats-row     { gap: 24px !important; }
                    .cta-pad       { padding: 40px 24px !important; }
                    .section-padded{ padding: 64px 20px !important; }
                }
            `}</style>

            <div style={{ background: bg, color: primary, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>

                {/* ══════════════════════ NAV ══════════════════════ */}
                <nav style={navStyle(dark, scrolled, border)}>
                    <div style={navInner()}>
                        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, fontSize: '1.1rem', color: primary }}>
                            <span style={logoCircle}><img src="/logo.png" alt="SamarthyaBot" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /></span>
                            <span>Samarthya<span style={{ color: '#FF9933' }}>Bot</span></span>
                        </a>

                        {/* Desktop nav links */}
                        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {NAV_LINKS.map(l => (
                                <a key={l.label} href={l.href} className="nav-link" style={{ color: secondary }}
                                    onClick={e => smoothScroll(e, l.href)}>
                                    {l.label}
                                </a>
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <a href="https://github.com/mebishnusahu0595/SamarthyaBot" target="_blank" rel="noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${border}`, fontSize: '0.82rem', fontWeight: 700, color: secondary }}>
                                <Github size={15} /> GitHub
                            </a>
                            <button onClick={() => setDark(d => !d)} style={themeBtn(dark, border)} aria-label="Toggle theme">
                                {dark ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                            {/* Hamburger */}
                            <button className="hamburger" onClick={() => setMenuOpen(o => !o)}
                                style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: primary, padding: 6 }}>
                                <div style={{ width: 22, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <span style={{ height: 2, background: primary, borderRadius: 2, display: 'block', transition: '0.2s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
                                    <span style={{ height: 2, background: primary, borderRadius: 2, display: 'block', opacity: menuOpen ? 0 : 1, transition: '0.2s' }} />
                                    <span style={{ height: 2, background: primary, borderRadius: 2, display: 'block', transition: '0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
                                </div>
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Mobile full-screen menu */}
                {menuOpen && (
                    <div className="mobile-menu">
                        {NAV_LINKS.map(l => (
                            <a key={l.label} href={l.href} className="mobile-menu-link" onClick={e => smoothScroll(e, l.href)}>{l.label}</a>
                        ))}
                        <Link to="/dashboard" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                    </div>
                )}

                {/* ══════════════════════ HERO ══════════════════════ */}
                <section style={{ maxWidth: 1100, margin: '0 auto', padding: '160px 24px 120px', textAlign: 'center', position: 'relative' }}>
                    {/* Background glow */}
                    <div style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 420, background: 'radial-gradient(ellipse at center, rgba(255,153,51,0.10) 0%, transparent 70%)', pointerEvents: 'none', animation: 'glow 5s ease infinite', zIndex: 0 }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {/* Version Badge */}
                        <div className="fade-up" style={badgeStyle(dark, border)}>
                            <span style={{ background: 'linear-gradient(135deg,#FF9933,#e8851d)', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '3px 9px', borderRadius: 5, letterSpacing: 1 }}>BETA 1.1</span>
                            <span style={{ color: secondary, fontSize: '0.82rem', fontWeight: 600 }}>Vectorized Memory & Gateway Tunneling Live</span>
                            <ChevronRight size={13} color={secondary} />
                        </div>

                        {/* Logo */}
                        <div className="fade-up-d1" style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
                            <img src="/logo.png" alt="SamarthyaBot" style={heroLogoChar()} />
                        </div>

                        {/* Headline */}
                        <h1 className="fade-up-d2 hero-title" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 950, letterSpacing: '-4px', lineHeight: 1.05, marginBottom: 22, color: primary }}>
                            Your Local<br />
                            <span className="flag-text">Agentic&nbsp;OS</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="fade-up-d3" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: secondary, maxWidth: 640, margin: '0 auto 52px', lineHeight: 1.75, fontWeight: 400 }}>
                            Run powerful AI agents <strong style={{ color: primary, fontWeight: 700 }}>locally on your machine</strong>. Bypass cloud limits, own your compute, and automate complex <strong style={{ color: primary, fontWeight: 700 }}>Indian digital workflows</strong> — fully private.
                        </p>

                        {/* CTA Row */}
                        <div className="fade-up-d4 hero-btns" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="#install" onClick={e => smoothScroll(e, '#install')} className="btn-primary">
                                <Terminal size={16} /> Get Started Free
                            </a>
                            <a href="https://github.com/mebishnusahu0595/SamarthyaBot" target="_blank" rel="noreferrer" className="btn-secondary">
                                <Github size={16} /> View on GitHub
                            </a>
                            <Link to="/dashboard" className="btn-secondary">
                                <Cpu size={16} /> Open Dashboard
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="fade-up-d4 stats-row" style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 72, flexWrap: 'wrap' }}>
                            {[
                                { label: 'License', val: 'MIT' },
                                { label: 'LLM Providers', val: '4+' },
                                { label: 'Built-in Tools', val: '30+' },
                                { label: 'Cloud Required', val: 'Zero' },
                            ].map(s => (
                                <div key={s.label} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.45rem', fontWeight: 900, color: primary }}>{s.val}</div>
                                    <div style={{ fontSize: '0.74rem', color: secondary, fontWeight: 600, letterSpacing: '0.5px', marginTop: 5 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Divider */}
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${border}, transparent)` }} />
                </div>

                {/* ════════════════ INSTALL ════════════════ */}
                <section id="install" className="section-padded" style={{ maxWidth: 820, margin: '0 auto', padding: '96px 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <SectionLabel dark={dark}>Quick Start</SectionLabel>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: primary, marginTop: 14, letterSpacing: '-1.5px' }}>
                            Deploy in 60 Seconds
                        </h2>
                        <p style={{ color: secondary, marginTop: 12, fontSize: '0.92rem' }}>Requires Node.js ≥ 20 and a local MongoDB instance.</p>
                    </div>
                    <div style={terminalCard(dark, border)}>
                        <div style={terminalHeader(dark, muted)}>
                            <div style={{ display: 'flex', gap: 7 }}>
                                {['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                            </div>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: muted }}>Terminal</span>
                            <div />
                        </div>
                        <div style={{ padding: '8px 0', fontFamily: 'monospace' }}>
                            {[
                                { cmd: 'npm install -g samarthya-bot', comment: '# install globally' },
                                { cmd: 'samarthya onboard', comment: '# interactive setup wizard' },
                                { cmd: 'samarthya gateway', comment: '# launch the control plane' },
                            ].map((l, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: i < 2 ? `1px solid ${dark ? '#13131e' : '#1e1e2a'}` : 'none' }}>
                                    <div style={{ display: 'flex', gap: 14, fontSize: '0.88rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span style={{ color: '#FF9933', fontWeight: 700, userSelect: 'none' }}>$</span>
                                        <span style={{ color: dark ? '#d0d0f0' : '#c8c8e8' }}>{l.cmd}</span>
                                        <span style={{ color: muted, fontSize: '0.8rem' }}>{l.comment}</span>
                                    </div>
                                    <CopyButton text={l.cmd} dark={dark} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <p style={{ color: secondary, fontSize: '0.8rem', textAlign: 'center', marginTop: 20 }}>
                        From source:{' '}
                        <code style={{ background: dark ? '#1a1a24' : '#eeeefc', padding: '2px 8px', borderRadius: 5, fontSize: '0.78rem', color: dark ? '#b0b0d8' : '#3a3a6e' }}>
                            git clone https://github.com/mebishnusahu0595/SamarthyaBot
                        </code>
                    </p>
                </section>

                {/* ════════════════ FEATURES ════════════════ */}
                <section id="features" style={{ background: dark ? '#07070e' : '#f4f4fa', padding: '96px 24px' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 60 }}>
                            <SectionLabel dark={dark}>Capabilities</SectionLabel>
                            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: primary, marginTop: 14, letterSpacing: '-1.5px' }}>
                                Built Different. Runs Locally.
                            </h2>
                            <p style={{ color: secondary, marginTop: 14, fontSize: '0.93rem', maxWidth: 520, margin: '14px auto 0' }}>
                                Everything you need to run an autonomous AI agent on your own hardware.
                            </p>
                        </div>
                        <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                            {FEATURES.map((f, i) => (
                                <div key={i} className="card-hover" style={{ padding: '28px 24px', borderRadius: 14, border: `1px solid ${border}`, background: dark ? '#0e0e16' : '#ffffff', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${f.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.accent, marginBottom: 18 }}>
                                        {f.icon}
                                    </div>
                                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: primary, marginBottom: 10 }}>{f.title}</h3>
                                    <p style={{ fontSize: '0.85rem', color: secondary, lineHeight: 1.7 }}>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════ INTEGRATIONS ════════════════ */}
                <section style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <SectionLabel dark={dark}>Integrations</SectionLabel>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: primary, marginTop: 14, letterSpacing: '-1.5px' }}>
                            Omnichannel Connectivity
                        </h2>
                        <p style={{ color: secondary, marginTop: 14, fontSize: '0.92rem', maxWidth: 440, margin: '14px auto 0' }}>
                            One control plane, many frontends. Talk to your agent where you already are.
                        </p>
                    </div>
                    <div className="int-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                        {INTEGRATIONS.map((item, i) => (
                            <div key={i} className="card-hover" style={{ padding: '18px 20px', borderRadius: 12, border: `1px solid ${border}`, background: surface, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, color: item.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, flexShrink: 0, lineHeight: 1 }}>
                                    {item.emoji}
                                </span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: primary }}>{item.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${border}, transparent)` }} />
                </div>

                {/* ════════════════ ARCHITECTURE ════════════════ */}
                <section id="architecture" style={{ background: dark ? '#07070e' : '#f4f4fa', padding: '96px 24px' }}>
                    <div style={{ maxWidth: 960, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 56 }}>
                            <SectionLabel dark={dark}>Under the Hood</SectionLabel>
                            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: primary, marginTop: 14, letterSpacing: '-1.5px' }}>
                                Architecture Overview
                            </h2>
                        </div>
                        <div className="arch-row" style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
                            {/* ASCII Diagram */}
                            <div style={{ flex: 1, minWidth: 280 }}>
                                <div style={{ ...terminalCard(dark, border), padding: 0 }}>
                                    <div style={terminalHeader(dark, muted)}>
                                        <div style={{ display: 'flex', gap: 7 }}>
                                            {['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                                        </div>
                                        <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: muted }}>System Topology</span>
                                        <div />
                                    </div>
                                    <pre style={{ padding: '22px 24px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: 1.85, color: dark ? '#7070a0' : '#5050a0', overflowX: 'auto' }}>{`WhatsApp · Telegram · WebUI · CLI
         │
         ▼
┌─────────────────────────┐
│   Samarthya Gateway     │
│   localhost:5000        │
└──────────┬──────────────┘
           │
     ┌─────┴───────┐
     ▼             ▼
 Planner      Skill Registry
 (ReAct)      (Plugins + Tools)
     │
     ├─ Background CRON
     ├─ Memory Vault (AES-256)
     └─ Vector Search (Local)`}</pre>
                                </div>
                            </div>

                            {/* Layer list */}
                            <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { icon: <MessageSquare size={18}/>, title: 'Surface Layer', desc: 'WhatsApp, Telegram, Web UI, CLI — unified gateway', accent: '#FF9933' },
                                    { icon: <Cpu size={18}/>, title: 'Planner Engine', desc: 'ReAct loop: Reason → Act → Observe', accent: '#6ee7f7' },
                                    { icon: <Database size={18}/>, title: 'Memory Vault', desc: 'AES-256 encrypted + semantic vector indexing', accent: '#a78bfa' },
                                    { icon: <Zap size={18}/>, title: 'Skill Registry', desc: 'Hot-plug JS plugins, shell scripts, 30+ built-ins', accent: '#22c55e' },
                                ].map((l, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 18px', borderRadius: 12, border: `1px solid ${border}`, background: dark ? '#0e0e16' : '#ffffff' }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${l.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: l.accent, flexShrink: 0 }}>{l.icon}</div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.87rem', color: primary, marginBottom: 4 }}>{l.title}</div>
                                            <div style={{ fontSize: '0.78rem', color: secondary, lineHeight: 1.5 }}>{l.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════ CLI ════════════════ */}
                <section id="cli" className="section-padded" style={{ maxWidth: 860, margin: '0 auto', padding: '96px 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <SectionLabel dark={dark}>CLI Reference</SectionLabel>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: primary, marginTop: 14, letterSpacing: '-1.5px' }}>
                            Control Everything from Your Terminal
                        </h2>
                    </div>
                    <div style={{ border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden', background: surface }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: dark ? '#0a0a14' : '#ededf8', borderBottom: `1px solid ${border}` }}>
                                    <th style={{ padding: '13px 22px', textAlign: 'left', fontWeight: 700, fontSize: '0.72rem', color: secondary, letterSpacing: '1.8px', textTransform: 'uppercase' }}>Command</th>
                                    <th style={{ padding: '13px 22px', textAlign: 'left', fontWeight: 700, fontSize: '0.72rem', color: secondary, letterSpacing: '1.8px', textTransform: 'uppercase' }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CLI_COMMANDS.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: i < CLI_COMMANDS.length - 1 ? `1px solid ${border}` : 'none' }}
                                        onMouseEnter={e => e.currentTarget.style.background = dark ? '#0c0c18' : '#f4f4fb'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '15px 22px' }}>
                                            <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#FF9933', background: 'rgba(255,153,51,0.08)', padding: '4px 10px', borderRadius: 6, fontWeight: 700, whiteSpace: 'nowrap' }}>{row.cmd}</code>
                                        </td>
                                        <td style={{ padding: '15px 22px', fontSize: '0.86rem', color: secondary, lineHeight: 1.5 }}>{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ════════════════ PLUGINS ════════════════ */}
                <section style={{ background: dark ? '#07070e' : '#f4f4fa', padding: '96px 24px' }}>
                    <div className="plug-row" style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 56, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 260 }}>
                            <SectionLabel dark={dark}>Extensibility</SectionLabel>
                            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 900, color: primary, marginTop: 16, marginBottom: 18, letterSpacing: '-1px', lineHeight: 1.2 }}>
                                Teach the Agent<br />New Superpowers
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: secondary, lineHeight: 1.8, marginBottom: 28 }}>
                                Drop any <code style={{ background: dark ? '#1a1a24' : '#e4e4f4', padding: '1px 6px', borderRadius: 4, fontSize: '0.83rem' }}>.js</code> file into{' '}
                                <code style={{ background: dark ? '#1a1a24' : '#e4e4f4', padding: '1px 6px', borderRadius: 4, fontSize: '0.83rem' }}>~/SamarthyaBot_Files/plugins/</code>{' '}
                                and the agent learns it on the fly — no restart required.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {['Hot-reload without restarting', 'Full async/await support', 'Type-safe parameter schema', 'Access to all memory APIs'].map((t, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.87rem', color: secondary }}>
                                        <CheckCircle2 size={16} color="#22c55e" /> {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1.2, minWidth: 300 }}>
                            <div style={{ ...terminalCard(dark, border) }}>
                                <div style={terminalHeader(dark, muted)}>
                                    <div style={{ display: 'flex', gap: 7 }}>
                                        {['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                                    </div>
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: muted }}>plugins/hello.js</span>
                                    <CopyButton text={PLUGIN_SNIPPET} dark={dark} />
                                </div>
                                <pre style={{ padding: '22px 24px', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.8, overflowX: 'auto', color: dark ? '#b0b0e0' : '#3a3a6e' }}>
{PLUGIN_SNIPPET}
                                </pre>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════ SECURITY ════════════════ */}
                <section id="security" className="section-padded" style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <SectionLabel dark={dark}>Privacy</SectionLabel>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: primary, marginTop: 14, letterSpacing: '-1.5px' }}>
                            Zero-Trust. Local-First. Always.
                        </h2>
                        <p style={{ color: secondary, marginTop: 14, fontSize: '0.93rem', maxWidth: 520, margin: '14px auto 0' }}>
                            Connecting an AI to your real-world data requires trust. That's why we built privacy in from the ground up.
                        </p>
                    </div>
                    <div className="spec-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                        {[
                            { icon: <Server size={22}/>, accent: '#6ee7f7', title: 'Local Control Plane', desc: 'The gateway runs entirely on YOUR machine. No SaaS, no subscription, no vendor lock-in.' },
                            { icon: <Globe size={22}/>, accent: '#22c55e', title: 'Offline-Ready with Ollama', desc: 'Swap to Ollama for 100% offline inference. Zero data ever reaches a remote server.' },
                            { icon: <Lock size={22}/>, accent: '#a78bfa', title: 'AES-256 Vault', desc: 'All sensitive data including API keys are encrypted at rest with your own vault key.' },
                            { icon: <AlertTriangle size={22}/>, accent: '#FF9933', title: 'Emergency Kill Switch', desc: 'Stop all background agents instantly with a single command from the dashboard.' },
                        ].map((s, i) => (
                            <div key={i} className="card-hover" style={{ padding: '28px 24px', borderRadius: 14, border: `1px solid ${border}`, background: surface, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ width: 42, height: 42, borderRadius: 10, background: `${s.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent, marginBottom: 16 }}>{s.icon}</div>
                                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: primary, marginBottom: 8 }}>{s.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: secondary, lineHeight: 1.7 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ════════════════ TESTIMONIALS ════════════════ */}
                <section style={{ background: dark ? '#07070e' : '#f4f4fa', padding: '96px 24px' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 56 }}>
                            <SectionLabel dark={dark}>Community</SectionLabel>
                            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: primary, marginTop: 14, letterSpacing: '-1.5px' }}>
                                Loved by Developers
                            </h2>
                        </div>
                        <div className="test-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                            {TESTIMONIALS.map((t, i) => (
                                <div key={i} className="card-hover" style={{ padding: '26px', borderRadius: 14, border: `1px solid ${border}`, background: dark ? '#0e0e16' : '#ffffff' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900, color: '#fff', flexShrink: 0, letterSpacing: '-0.5px' }}>
                                            {t.initials}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: primary }}>{t.name}</div>
                                            <div style={{ fontSize: '0.76rem', color: muted, marginTop: 2 }}>{t.handle}</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                                            {[1,2,3,4,5].map(s => <Star key={s} size={11} fill="#FF9933" color="#FF9933" />)}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: secondary, lineHeight: 1.75, fontStyle: 'italic' }}>"{t.text}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════ CTA ════════════════ */}
                <section style={{ maxWidth: 860, margin: '0 auto', padding: '96px 24px' }}>
                    <div className="cta-pad" style={{ borderRadius: 22, overflow: 'hidden', position: 'relative', padding: '76px 60px', textAlign: 'center', background: dark ? 'linear-gradient(135deg, #120a02 0%, #0c0c16 50%, #060818 100%)' : 'linear-gradient(135deg, #fff8f0 0%, #ffffff 50%, #f0f0ff 100%)', border: `1px solid ${dark ? '#2a1a0a' : '#f0e8e0'}` }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(255,153,51,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
                        <div style={{ position: 'relative' }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 18 }}>🇮🇳</span>
                            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 950, color: primary, letterSpacing: '-2px', marginBottom: 18, lineHeight: 1.15 }}>
                                Built for India's<br />Digital Future
                            </h2>
                            <p style={{ color: secondary, fontSize: '0.95rem', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.75 }}>
                                Native support for GST portals, IRCTC, UPI, and Hinglish — the first Agentic OS designed from the ground up for the Indian digital highway.
                            </p>
                            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <a href="#install" onClick={e => smoothScroll(e, '#install')} className="btn-primary">
                                    Start Building <ArrowRight size={16} />
                                </a>
                                <a href="https://github.com/mebishnusahu0595/SamarthyaBot" target="_blank" rel="noreferrer" className="btn-secondary">
                                    <Star size={16} /> Star on GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════ FOOTER ════════════════ */}
                <footer style={{ borderTop: `1px solid ${border}`, padding: '64px 24px 40px' }}>
                    <div className="footer-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', marginBottom: 52 }}>
                        {/* Brand col */}
                        <div style={{ maxWidth: 250 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, fontSize: '1.05rem', color: primary, marginBottom: 12 }}>
                                <span style={logoCircle}><img src="/logo.png" alt="SamarthyaBot" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /></span>
                                Samarthya<span style={{ color: '#FF9933' }}>Bot</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: secondary, lineHeight: 1.7 }}>
                                Privacy-first agentic OS built for India's digital future. Run it locally, own your intelligence.
                            </p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                                <a href="https://github.com/mebishnusahu0595/SamarthyaBot" target="_blank" rel="noreferrer" style={iconPill(dark, border)}>
                                    <Github size={14} color={secondary} />
                                </a>
                                <a href="https://www.npmjs.com/package/samarthya-bot" target="_blank" rel="noreferrer" style={iconPill(dark, border)}>
                                    <Package size={14} color={secondary} />
                                </a>
                            </div>
                        </div>

                        {/* Link columns */}
                        <div style={{ display: 'flex', gap: 52, flexWrap: 'wrap' }}>
                            {[
                                {
                                    heading: 'Product',
                                    links: [
                                        { label: 'Features', href: '#features', scroll: true },
                                        { label: 'CLI Reference', href: '#cli', scroll: true },
                                        { label: 'Architecture', href: '#architecture', scroll: true },
                                        { label: 'Dashboard', href: '/dashboard', internal: true },
                                    ]
                                },
                                {
                                    heading: 'Resources',
                                    links: [
                                        { label: 'GitHub', href: 'https://github.com/mebishnusahu0595/SamarthyaBot', ext: true },
                                        { label: 'NPM Package', href: 'https://www.npmjs.com/package/samarthya-bot', ext: true },
                                        { label: 'Report a Bug', href: 'https://github.com/mebishnusahu0595/SamarthyaBot/issues', ext: true },
                                    ]
                                },
                            ].map((col, ci) => (
                                <div key={ci}>
                                    <div style={{ fontWeight: 800, fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: muted, marginBottom: 18 }}>{col.heading}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {col.links.map((lk, li) => (
                                            lk.internal
                                                ? <Link key={li} to={lk.href}
                                                    style={{ fontSize: '0.86rem', color: secondary, fontWeight: 600 }}
                                                    onMouseEnter={e => e.target.style.color = primary}
                                                    onMouseLeave={e => e.target.style.color = secondary}>
                                                    {lk.label}
                                                  </Link>
                                                : lk.ext
                                                ? <a key={li} href={lk.href} target="_blank" rel="noreferrer"
                                                    style={{ fontSize: '0.86rem', color: secondary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
                                                    onMouseEnter={e => e.currentTarget.style.color = primary}
                                                    onMouseLeave={e => e.currentTarget.style.color = secondary}>
                                                    {lk.label} <ExternalLink size={11} />
                                                  </a>
                                                : <a key={li} href={lk.href}
                                                    style={{ fontSize: '0.86rem', color: secondary, fontWeight: 600 }}
                                                    onClick={e => smoothScroll(e, lk.href)}
                                                    onMouseEnter={e => e.target.style.color = primary}
                                                    onMouseLeave={e => e.target.style.color = secondary}>
                                                    {lk.label}
                                                  </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 24, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <p style={{ fontSize: '0.76rem', color: muted }}>
                            © 2025 Samarthya Project · MIT License · Built with ❤️ in India by <strong style={{ color: secondary }}>Bishnu Sahu</strong>
                        </p>
                        <p style={{ fontSize: '0.72rem', color: muted }}>Not affiliated with OpenAI or Anthropic 🇮🇳</p>
                    </div>
                </footer>

            </div>
        </>
    );
}

/* ─────────────────────── STYLE HELPERS ─────────────────────── */

const logoCircle = {
    width: 34, height: 34, borderRadius: 8,
    background: '#0e0e16',
    border: '1px solid #2a2a38',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
};

const heroLogoChar = () => ({
    width: 84, height: 84, borderRadius: 22,
    objectFit: 'contain',
    filter: 'drop-shadow(0 8px 28px rgba(255,153,51,0.40))',
    flexShrink: 0,
});

const navStyle = (dark, scrolled, border) => ({
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
    background: scrolled ? (dark ? 'rgba(6,6,10,0.88)' : 'rgba(255,255,255,0.88)') : 'transparent',
    backdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
    borderBottom: scrolled ? `1px solid ${border}` : '1px solid transparent',
    transition: 'all 0.3s ease',
});

const navInner = () => ({
    maxWidth: 1100, margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 66,
});

const themeBtn = (dark, border) => ({
    width: 36, height: 36, borderRadius: 9,
    border: `1.5px solid ${border}`, background: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: dark ? '#888' : '#555',
});

const badgeStyle = (dark, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '7px 16px', borderRadius: 100,
    border: `1px solid ${border}`,
    background: dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
    marginBottom: 30, cursor: 'default',
});

const terminalCard = (dark, border) => ({
    borderRadius: 14, overflow: 'hidden',
    border: `1px solid ${border}`,
    background: dark ? '#09090f' : '#111',
});

const terminalHeader = (dark, muted) => ({
    padding: '11px 16px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
    borderBottom: `1px solid ${dark ? '#151520' : '#1e1e28'}`,
});

const copyBtnStyle = (dark) => ({
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '4px 6px', borderRadius: 6, flexShrink: 0,
    display: 'flex', alignItems: 'center',
});

const sectionLabelStyle = () => ({
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '5px 14px', borderRadius: 100,
    background: 'rgba(255,153,51,0.08)',
    border: '1px solid rgba(255,153,51,0.18)',
});

const iconPill = (dark, border) => ({
    width: 32, height: 32, borderRadius: 8,
    border: `1.5px solid ${border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color 0.15s', background: 'transparent',
});
