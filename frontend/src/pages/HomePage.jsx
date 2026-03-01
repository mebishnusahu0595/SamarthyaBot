import React, { useState, useEffect, useRef } from 'react';
import {
    Mic, Shield, Zap, Globe, Clock, ChevronRight, Star, Check,
    Smartphone, Brain, FileText, CreditCard, Users, Bell, ArrowRight,
    Github, Linkedin, Twitter, Play, Volume2, IndianRupee
} from 'lucide-react';

const timelineEvents = [
    {
        time: '08:00 AM',
        title: 'Good morning Rahul, aapki UPI bill due hai aaj',
        desc: 'Electricity bill ₹2,340 - auto-reminder triggered',
        icon: '⚡',
        color: '#FF9933'
    },
    {
        time: '10:30 AM',
        title: 'IRCTC Tatkal booking done! PNR: 4521789036',
        desc: 'Delhi → Mumbai Rajdhani, 2A, Seat 42',
        icon: '🚆',
        color: '#138808'
    },
    {
        time: '02:00 PM',
        title: '"Mera PAN number hai ABCDE1234F"',
        desc: '⚠️ Sensitive data detected → Masked: AB***4F',
        icon: '🔐',
        color: '#f43f5e'
    },
    {
        time: '06:00 PM',
        title: 'GST filed successfully! Acknowledgement: ACK-2025-789',
        desc: 'GSTR-3B auto-filled from your invoices. Next due: 20th March',
        icon: '📊',
        color: '#6366f1'
    }
];

const toolPacks = [
    {
        id: 'student',
        icon: '🎓',
        name: 'Student Pack',
        nameHi: 'स्टूडेंट पैक',
        tools: ['PDF Summarizer', 'Exam Reminders', 'Assignment Helper', 'Notes AI', 'Calculator', 'Web Search'],
        color: '#6366f1'
    },
    {
        id: 'business',
        icon: '🏢',
        name: 'Business Pack',
        nameHi: 'बिज़नेस पैक',
        tools: ['GST Reminder', 'Invoice Generator', 'Email Automation', 'UPI Links', 'Excel Helper', 'Client Follow-up'],
        color: '#FF9933'
    },
    {
        id: 'developer',
        icon: '👨‍💻',
        name: 'Developer Pack',
        nameHi: 'डेवलपर पैक',
        tools: ['Code Explain', 'Log Monitor', 'GitHub Helper', 'API Tester', 'Bug Finder', 'Deploy Assistant'],
        color: '#14b8a6'
    },
    {
        id: 'personal',
        icon: '🏠',
        name: 'Personal Pack',
        nameHi: 'पर्सनल पैक',
        tools: ['Bill Tracker', 'File Organizer', 'Subscription Manager', 'Weather', 'Reminders', 'Voice Notes'],
        color: '#f59e0b'
    }
];

const comparisons = [
    {
        competitor: 'ChatGPT',
        competitorResponse: '"I can\'t access external websites or book tickets for you."',
        samarthyaResponse: '"IRCTC booked! PNR: 4521789. Confirmation SMS bhi bhej diya."',
        icon: '🤖'
    },
    {
        competitor: 'Claude',
        competitorResponse: '"I don\'t have information about Indian tax filing deadlines."',
        samarthyaResponse: '"GSTR-3B due 20th March! Reminder set + auto-fill ready."',
        icon: '🧠'
    },
    {
        competitor: 'Siri / Google',
        competitorResponse: '"Here are some search results for UPI payment..."',
        samarthyaResponse: '"₹500 ka UPI link bana diya. GPay / PhonePe se direct pay karo."',
        icon: '📱'
    }
];

const stats = [
    { icon: '🔒', label: 'Made in India', labelHi: 'भारत में बना' },
    { icon: '🏛️', label: 'Govt API Ready', labelHi: 'सरकारी API' },
    { icon: '📱', label: '50K+ Users', labelHi: '50K+ यूज़र्स' },
    { icon: '⭐', label: '4.9 Rating', labelHi: '4.9 रेटिंग' }
];

const pricingPlans = [
    {
        name: 'Free',
        nameHi: 'फ्री',
        price: '₹0',
        period: '/month',
        features: ['100 actions/month', '3 Tool Packs', 'Basic Voice Mode', 'Community Support'],
        cta: 'Start Free',
        popular: false,
        color: '#a8a8c0'
    },
    {
        name: 'Pro',
        nameHi: 'प्रो',
        price: '₹299',
        period: '/month',
        features: ['Unlimited actions', 'All Tool Packs', 'Voice + Screen AI', 'Priority Support', 'Offline Mode', 'WhatsApp Integration'],
        cta: 'Upgrade to Pro',
        popular: true,
        color: '#FF9933'
    },
    {
        name: 'Business',
        nameHi: 'बिज़नेस',
        price: '₹999',
        period: '/month',
        features: ['Everything in Pro', 'Multi-Agent Swarm', 'Family Mode (5 users)', 'Custom Workflows', 'API Access', 'Dedicated Support'],
        cta: 'Contact Sales',
        popular: false,
        color: '#138808'
    }
];

export default function HomePage({ onNavigateToLogin }) {
    const [activePackIdx, setActivePackIdx] = useState(0);
    const [visibleSections, setVisibleSections] = useState(new Set());
    const [typedText, setTypedText] = useState('');
    const heroTexts = [
        'File my GST',
        'IRCTC ticket book karo',
        'UPI link banao ₹500 ka',
        'Mera Aadhaar safe rakh'
    ];
    const [heroTextIdx, setHeroTextIdx] = useState(0);

    // Typing animation for hero
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
        }, 60);
        return () => clearInterval(typeInterval);
    }, [heroTextIdx]);

    // Intersection observer for section animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setVisibleSections(prev => new Set([...prev, entry.target.id]));
                    }
                });
            },
            { threshold: 0.15 }
        );

        document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const isVisible = (id) => visibleSections.has(id);

    return (
        <div style={styles.page}>
            {/* ===== NAVBAR ===== */}
            <nav style={styles.nav}>
                <div style={styles.navInner}>
                    <div style={styles.navBrand}>
                        <span style={styles.navLogo}>स</span>
                        <span style={styles.navName}>SamarthyaBot</span>
                    </div>
                    <div style={styles.navLinks}>
                        <a href="#features" style={styles.navLink}>Features</a>
                        <a href="#packs" style={styles.navLink}>Tool Packs</a>
                        <a href="#pricing" style={styles.navLink}>Pricing</a>
                        <button onClick={onNavigateToLogin} style={styles.navCta}>
                            Launch App <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section style={styles.hero}>
                <div style={styles.heroOrb1} />
                <div style={styles.heroOrb2} />
                <div style={styles.heroOrb3} />

                <div style={styles.heroContent}>
                    <div style={styles.heroBadge}>
                        <span style={styles.heroBadgeDot} />
                        🇮🇳 Privacy-first AI Operator — Built for India
                    </div>

                    <h1 style={styles.heroTitle}>
                        Your Personal AI Assistant
                        <br />
                        <span style={styles.heroTitleAccent}>That Actually Understands India</span>
                    </h1>

                    <p style={styles.heroSubtitle}>
                        GST file karo, IRCTC ticket lo, UPI payment bhejo — sab ek AI se.
                        <br />Hindi, Hinglish aur English mein baat karo.
                    </p>

                    {/* Live Demo Terminal */}
                    <div style={styles.terminal}>
                        <div style={styles.terminalHeader}>
                            <div style={styles.terminalDots}>
                                <span style={{ ...styles.terminalDot, background: '#ef4444' }} />
                                <span style={{ ...styles.terminalDot, background: '#f59e0b' }} />
                                <span style={{ ...styles.terminalDot, background: '#138808' }} />
                            </div>
                            <span style={styles.terminalTitle}>SamarthyaBot — Live Demo</span>
                        </div>
                        <div style={styles.terminalBody}>
                            <div style={styles.terminalLine}>
                                <span style={styles.terminalPrompt}>You →</span>
                                <span style={styles.terminalTyped}>{typedText}</span>
                                <span style={styles.terminalCursor}>|</span>
                            </div>
                            <div style={styles.terminalResponse}>
                                <span style={styles.terminalBot}>स Bot →</span>
                                <span style={styles.terminalText}>
                                    {heroTextIdx === 0 && '✅ GSTR-3B auto-filled! Deadline: 20th March. Reminder set.'}
                                    {heroTextIdx === 1 && '🚆 Tatkal booked! PNR: 4521789036. Delhi→Mumbai Rajdhani 2A.'}
                                    {heroTextIdx === 2 && '💳 UPI Link: upi://pay?am=500&cu=INR — GPay/PhonePe ready!'}
                                    {heroTextIdx === 3 && '🔐 Aadhaar detected & masked: XXXX XXXX 9012. Safe mode ON.'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.heroCtas}>
                        <button onClick={onNavigateToLogin} style={styles.heroBtn}>
                            Start Free <Zap size={18} />
                        </button>
                        <button style={styles.heroBtn2}>
                            <Play size={18} /> Watch How It Works
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== TRUST BAR ===== */}
            <section style={styles.trustBar}>
                {stats.map((s, i) => (
                    <div key={i} style={styles.trustItem}>
                        <span style={styles.trustIcon}>{s.icon}</span>
                        <div>
                            <div style={styles.trustLabel}>{s.label}</div>
                            <div style={styles.trustLabelHi}>{s.labelHi}</div>
                        </div>
                    </div>
                ))}
            </section>

            {/* ===== DAY TIMELINE ===== */}
            <section id="features" data-animate style={{
                ...styles.section,
                opacity: isVisible('features') ? 1 : 0,
                transform: isVisible('features') ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out'
            }}>
                <div style={styles.sectionInner}>
                    <div style={styles.sectionBadge}>✨ A Day with SamarthyaBot</div>
                    <h2 style={styles.sectionTitle}>One AI. Your Entire Day, Handled.</h2>
                    <p style={styles.sectionSubtitle}>
                        Subah se raat tak, har kaam automate — bilkul aapke tarike se.
                    </p>

                    <div style={styles.timeline}>
                        {timelineEvents.map((evt, i) => (
                            <div key={i} style={styles.timelineItem}>
                                <div style={styles.timelineLeft}>
                                    <div style={{ ...styles.timelineDot, background: evt.color }} />
                                    {i < timelineEvents.length - 1 && <div style={styles.timelineLine} />}
                                </div>
                                <div style={styles.timelineCard}>
                                    <div style={styles.timelineTime}>
                                        <Clock size={13} /> {evt.time}
                                    </div>
                                    <div style={styles.timelineEventTitle}>
                                        <span style={styles.timelineIcon}>{evt.icon}</span> {evt.title}
                                    </div>
                                    <div style={styles.timelineDesc}>{evt.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== VOICE + FEATURES ===== */}
            <section id="voice" data-animate style={{
                ...styles.section,
                background: 'var(--bg-secondary)',
                opacity: isVisible('voice') ? 1 : 0,
                transform: isVisible('voice') ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out'
            }}>
                <div style={styles.sectionInner}>
                    <div style={styles.sectionBadge}>🎤 Voice-First Design</div>
                    <h2 style={styles.sectionTitle}>Bolo, Mat Likho.</h2>
                    <p style={styles.sectionSubtitle}>
                        90% Indians prefer voice. SamarthyaBot Hindi aur Hinglish voice commands samajhta hai.
                    </p>

                    <div style={styles.voiceGrid}>
                        <div style={styles.voiceCard}>
                            <div style={styles.voiceMicWrap}>
                                <div style={styles.voiceMic}>
                                    <Mic size={32} color="#FF9933" />
                                </div>
                            </div>
                            <h3 style={styles.voiceCardTitle}>🗣️ Voice Commands</h3>
                            <p style={styles.voiceCardDesc}>"GST ki deadline kab hai?" — Bolo aur kaam ho jaye</p>
                        </div>
                        <div style={styles.voiceCard}>
                            <div style={styles.voiceFeatureIcon}>🌐</div>
                            <h3 style={styles.voiceCardTitle}>Offline Mode</h3>
                            <p style={styles.voiceCardDesc}>Internet nahi? No problem. Local Ollama se chalega.</p>
                        </div>
                        <div style={styles.voiceCard}>
                            <div style={styles.voiceFeatureIcon}>📱</div>
                            <h3 style={styles.voiceCardTitle}>WhatsApp Native</h3>
                            <p style={styles.voiceCardDesc}>WhatsApp pe bolo "Remind me" — bot sun lega.</p>
                        </div>
                        <div style={styles.voiceCard}>
                            <div style={styles.voiceFeatureIcon}>👁️</div>
                            <h3 style={styles.voiceCardTitle}>Screen Understanding</h3>
                            <p style={styles.voiceCardDesc}>Screenshot bhejo, AI samajh ke action lega.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TOOL PACKS ===== */}
            <section id="packs" data-animate style={{
                ...styles.section,
                opacity: isVisible('packs') ? 1 : 0,
                transform: isVisible('packs') ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out'
            }}>
                <div style={styles.sectionInner}>
                    <div style={styles.sectionBadge}>🛠️ Verticalized Tool Packs</div>
                    <h2 style={styles.sectionTitle}>Choose Your Superpower</h2>
                    <p style={styles.sectionSubtitle}>Generic AI nahi. Aapke kaam ke liye specialized tools.</p>

                    <div style={styles.packsRow}>
                        {toolPacks.map((pack, i) => (
                            <button
                                key={pack.id}
                                onClick={() => setActivePackIdx(i)}
                                style={{
                                    ...styles.packTab,
                                    ...(activePackIdx === i ? {
                                        background: `${pack.color}18`,
                                        borderColor: pack.color,
                                        color: pack.color
                                    } : {})
                                }}
                            >
                                <span style={{ fontSize: '1.3rem' }}>{pack.icon}</span>
                                {pack.name}
                            </button>
                        ))}
                    </div>

                    <div style={styles.packDetail}>
                        <div style={styles.packDetailLeft}>
                            <span style={styles.packDetailIcon}>{toolPacks[activePackIdx].icon}</span>
                            <h3 style={styles.packDetailName}>{toolPacks[activePackIdx].name}</h3>
                            <p style={styles.packDetailNameHi}>{toolPacks[activePackIdx].nameHi}</p>
                        </div>
                        <div style={styles.packDetailTools}>
                            {toolPacks[activePackIdx].tools.map((tool, i) => (
                                <div key={i} style={{
                                    ...styles.packToolChip,
                                    borderColor: `${toolPacks[activePackIdx].color}40`,
                                    animationDelay: `${i * 0.08}s`
                                }}>
                                    <Check size={14} color={toolPacks[activePackIdx].color} /> {tool}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== COMPARISON ===== */}
            <section id="compare" data-animate style={{
                ...styles.section,
                background: 'var(--bg-secondary)',
                opacity: isVisible('compare') ? 1 : 0,
                transform: isVisible('compare') ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out'
            }}>
                <div style={styles.sectionInner}>
                    <div style={styles.sectionBadge}>⚔️ Bold Comparison</div>
                    <h2 style={styles.sectionTitle}>Why SamarthyaBot vs Generic AI?</h2>
                    <p style={styles.sectionSubtitle}>India-specific problems need India-specific solutions.</p>

                    <div style={styles.compareGrid}>
                        {comparisons.map((comp, i) => (
                            <div key={i} style={styles.compareCard}>
                                <div style={styles.compareRow}>
                                    <div style={styles.compareCompetitor}>
                                        <div style={styles.compareName}>{comp.icon} {comp.competitor}</div>
                                        <p style={styles.compareText}>{comp.competitorResponse}</p>
                                    </div>
                                    <div style={styles.compareVs}>VS</div>
                                    <div style={styles.compareSamarthya}>
                                        <div style={styles.compareName}>
                                            <span style={styles.compareSmLogo}>स</span> SamarthyaBot
                                        </div>
                                        <p style={styles.compareTextWin}>{comp.samarthyaResponse}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PRICING ===== */}
            <section id="pricing" data-animate style={{
                ...styles.section,
                opacity: isVisible('pricing') ? 1 : 0,
                transform: isVisible('pricing') ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out'
            }}>
                <div style={styles.sectionInner}>
                    <div style={styles.sectionBadge}>💰 Indian Pricing</div>
                    <h2 style={styles.sectionTitle}>Simple, Transparent, in ₹ Rupees</h2>
                    <p style={styles.sectionSubtitle}>No dollar pricing. No hidden charges. UPI se pay karo.</p>

                    <div style={styles.pricingGrid}>
                        {pricingPlans.map((plan, i) => (
                            <div key={i} style={{
                                ...styles.pricingCard,
                                ...(plan.popular ? styles.pricingPopular : {})
                            }}>
                                {plan.popular && <div style={styles.popularBadge}>🔥 Most Popular</div>}
                                <h3 style={styles.pricingName}>{plan.name}</h3>
                                <p style={styles.pricingNameHi}>{plan.nameHi}</p>
                                <div style={styles.pricingPrice}>
                                    <span style={{ ...styles.pricingAmount, color: plan.color }}>{plan.price}</span>
                                    <span style={styles.pricingPeriod}>{plan.period}</span>
                                </div>
                                <ul style={styles.pricingFeatures}>
                                    {plan.features.map((f, j) => (
                                        <li key={j} style={styles.pricingFeature}>
                                            <Check size={15} color={plan.color} /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button style={{
                                    ...styles.pricingCta,
                                    ...(plan.popular ? {
                                        background: 'var(--gradient-primary)',
                                        color: '#0D0D0D'
                                    } : {})
                                }}>
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={styles.paymentMethods}>
                        <span style={styles.paymentLabel}>Payment Methods:</span>
                        <span style={styles.paymentBadge}>UPI</span>
                        <span style={styles.paymentBadge}>Credit Card</span>
                        <span style={styles.paymentBadge}>Net Banking</span>
                        <span style={styles.paymentBadge}>PhonePe</span>
                        <span style={styles.paymentBadge}>GPay</span>
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section style={styles.ctaSection}>
                <div style={styles.ctaOrb} />
                <h2 style={styles.ctaTitle}>Ready to Supercharge Your Day?</h2>
                <p style={styles.ctaSubtitle}>
                    Aaj hi shuru karo. 100 free actions. No credit card needed.
                </p>
                <button onClick={onNavigateToLogin} style={styles.ctaBtn}>
                    Start Free Now <Zap size={20} />
                </button>
            </section>

            {/* ===== FOOTER ===== */}
            <footer style={styles.footer}>
                <div style={styles.footerInner}>
                    <div style={styles.footerBrand}>
                        <span style={styles.footerLogo}>स</span>
                        <span style={styles.footerName}>SamarthyaBot</span>
                    </div>
                    <p style={styles.footerTagline}>Built with ❤️ in India</p>
                    <div style={styles.footerLinks}>
                        <a href="#" style={styles.footerLink}><Twitter size={18} /></a>
                        <a href="#" style={styles.footerLink}><Linkedin size={18} /></a>
                        <a href="#" style={styles.footerLink}><Github size={18} /></a>
                    </div>
                    <p style={styles.footerCopy}>© 2025 SamarthyaBot. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

const styles = {
    page: {
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
    },

    /* Nav */
    nav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(13, 13, 13, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
    },
    navInner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    navBrand: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    navLogo: {
        fontSize: '1.5rem',
        fontFamily: 'var(--font-hindi)',
        fontWeight: 700,
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    navName: {
        fontSize: '1.15rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
    },
    navLink: {
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: 500,
        transition: 'color 0.2s',
    },
    navCta: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 22px',
        background: 'var(--gradient-primary)',
        color: '#0D0D0D',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'var(--font-primary)',
        transition: 'all 0.3s',
    },

    /* Hero */
    hero: {
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 32px 80px',
        overflow: 'hidden',
    },
    heroOrb1: {
        position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,153,51,0.1) 0%, transparent 65%)',
        top: '-250px', right: '-150px',
        animation: 'float 10s ease-in-out infinite',
    },
    heroOrb2: {
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(19,136,8,0.07) 0%, transparent 65%)',
        bottom: '-200px', left: '-150px',
        animation: 'float 12s ease-in-out infinite reverse',
    },
    heroOrb3: {
        position: 'absolute', width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,0,128,0.06) 0%, transparent 65%)',
        top: '40%', left: '15%',
        animation: 'float 14s ease-in-out infinite',
    },
    heroContent: {
        position: 'relative', zIndex: 1, maxWidth: '800px',
        animation: 'fadeInUp 0.8s ease-out',
    },
    heroBadge: {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '8px 20px', background: 'rgba(255,153,51,0.08)',
        border: '1px solid rgba(255,153,51,0.2)', borderRadius: 'var(--radius-full)',
        fontSize: '0.82rem', color: 'var(--accent-saffron)', fontWeight: 500,
        marginBottom: '28px',
    },
    heroBadgeDot: {
        width: '7px', height: '7px', borderRadius: '50%', background: '#138808',
        animation: 'pulse 2s infinite',
    },
    heroTitle: {
        fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px',
        color: 'var(--text-primary)',
    },
    heroTitleAccent: {
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    heroSubtitle: {
        fontSize: '1.15rem', lineHeight: 1.7, color: 'var(--text-secondary)',
        marginBottom: '36px', fontFamily: 'var(--font-primary)',
    },

    /* Terminal */
    terminal: {
        maxWidth: '620px', margin: '0 auto 36px', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', border: '1px solid var(--border-primary)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        textAlign: 'left',
    },
    terminalHeader: {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 18px', background: 'rgba(26,26,46,0.8)',
        borderBottom: '1px solid var(--border-subtle)',
    },
    terminalDots: { display: 'flex', gap: '7px' },
    terminalDot: { width: '11px', height: '11px', borderRadius: '50%' },
    terminalTitle: { fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 },
    terminalBody: {
        padding: '22px 20px', background: 'var(--bg-primary)', minHeight: '100px',
        fontFamily: "'Courier New', monospace",
    },
    terminalLine: {
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.9rem',
    },
    terminalPrompt: { color: '#138808', fontWeight: 700, flexShrink: 0 },
    terminalTyped: { color: 'var(--text-primary)' },
    terminalCursor: {
        color: 'var(--accent-saffron)', fontWeight: 100, animation: 'blink 1s step-end infinite',
    },
    terminalResponse: {
        display: 'flex', gap: '8px', fontSize: '0.85rem', lineHeight: 1.6,
    },
    terminalBot: { color: '#FF9933', fontWeight: 700, flexShrink: 0 },
    terminalText: { color: 'var(--text-secondary)' },

    heroCtas: {
        display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap',
    },
    heroBtn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '16px 36px', background: 'var(--gradient-primary)', color: '#0D0D0D',
        border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1.05rem',
        fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-primary)',
        boxShadow: 'var(--shadow-glow-strong)', transition: 'all 0.3s',
    },
    heroBtn2: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '16px 32px', background: 'transparent', color: 'var(--text-primary)',
        border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)',
        fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font-primary)', transition: 'all 0.3s',
    },

    /* Trust Bar */
    trustBar: {
        display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap',
        padding: '32px', borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)',
    },
    trustItem: {
        display: 'flex', alignItems: 'center', gap: '12px',
    },
    trustIcon: { fontSize: '1.6rem' },
    trustLabel: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' },
    trustLabelHi: { fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hindi)' },

    /* Sections */
    section: { padding: '100px 32px' },
    sectionInner: { maxWidth: '1100px', margin: '0 auto' },
    sectionBadge: {
        display: 'inline-block', padding: '6px 16px', background: 'rgba(255,153,51,0.08)',
        border: '1px solid rgba(255,153,51,0.18)', borderRadius: 'var(--radius-full)',
        fontSize: '0.8rem', color: 'var(--accent-saffron)', fontWeight: 600, marginBottom: '16px',
    },
    sectionTitle: {
        fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px',
    },
    sectionSubtitle: {
        fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '600px',
    },

    /* Timeline */
    timeline: { display: 'flex', flexDirection: 'column', maxWidth: '700px' },
    timelineItem: { display: 'flex', gap: '20px' },
    timelineLeft: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0,
    },
    timelineDot: { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0 },
    timelineLine: { width: '2px', flex: 1, background: 'var(--border-subtle)', margin: '4px 0' },
    timelineCard: {
        flex: 1, padding: '20px 24px', background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
        marginBottom: '16px', transition: 'all 0.3s',
    },
    timelineTime: {
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600,
    },
    timelineIcon: { fontSize: '1.1rem' },
    timelineEventTitle: {
        fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px',
    },
    timelineDesc: { fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 },

    /* Voice Grid */
    voiceGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
    },
    voiceCard: {
        padding: '28px 24px', background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
        textAlign: 'center', transition: 'all 0.3s',
    },
    voiceMicWrap: { display: 'flex', justifyContent: 'center', marginBottom: '16px' },
    voiceMic: {
        width: '72px', height: '72px', borderRadius: '50%',
        background: 'rgba(255,153,51,0.1)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        animation: 'voicePulse 2s infinite',
    },
    voiceFeatureIcon: { fontSize: '2.5rem', marginBottom: '16px' },
    voiceCardTitle: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' },
    voiceCardDesc: { fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 },

    /* Packs */
    packsRow: {
        display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap',
    },
    packTab: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 22px', background: 'var(--bg-card)',
        border: '2px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
        color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'var(--font-primary)', transition: 'all 0.25s',
    },
    packDetail: {
        display: 'flex', gap: '40px', padding: '36px', background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
        flexWrap: 'wrap', alignItems: 'center',
    },
    packDetailLeft: { textAlign: 'center', minWidth: '160px' },
    packDetailIcon: { fontSize: '3.5rem', display: 'block', marginBottom: '10px' },
    packDetailName: { fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' },
    packDetailNameHi: { fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hindi)' },
    packDetailTools: {
        flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px',
    },
    packToolChip: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
        fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500,
        animation: 'fadeIn 0.3s ease-out both',
    },

    /* Comparison */
    compareGrid: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' },
    compareCard: {
        padding: '24px', background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
    },
    compareRow: {
        display: 'flex', alignItems: 'stretch', gap: '16px', flexWrap: 'wrap',
    },
    compareCompetitor: {
        flex: 1, padding: '16px', background: 'rgba(239,68,68,0.04)',
        border: '1px solid rgba(239,68,68,0.12)', borderRadius: 'var(--radius-md)', minWidth: '250px',
    },
    compareVs: {
        display: 'flex', alignItems: 'center', fontWeight: 800,
        color: 'var(--text-muted)', fontSize: '0.9rem',
    },
    compareSamarthya: {
        flex: 1, padding: '16px', background: 'rgba(19,136,8,0.04)',
        border: '1px solid rgba(19,136,8,0.15)', borderRadius: 'var(--radius-md)', minWidth: '250px',
    },
    compareName: {
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px',
    },
    compareSmLogo: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '20px', height: '20px', borderRadius: '4px',
        background: 'var(--gradient-primary)', color: '#0D0D0D',
        fontSize: '0.7rem', fontFamily: 'var(--font-hindi)', fontWeight: 700,
    },
    compareText: { fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 },
    compareTextWin: {
        fontSize: '0.85rem', color: '#138808', fontWeight: 500, lineHeight: 1.5,
    },

    /* Pricing */
    pricingGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px', marginBottom: '32px',
    },
    pricingCard: {
        padding: '32px 28px', background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
        position: 'relative', transition: 'all 0.3s',
    },
    pricingPopular: {
        border: '2px solid var(--accent-saffron)',
        boxShadow: 'var(--shadow-glow)',
    },
    popularBadge: {
        position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
        padding: '4px 16px', background: 'var(--gradient-primary)', color: '#0D0D0D',
        borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
    },
    pricingName: { fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' },
    pricingNameHi: { fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hindi)', marginBottom: '16px' },
    pricingPrice: { display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' },
    pricingAmount: { fontSize: '2.4rem', fontWeight: 800 },
    pricingPeriod: { fontSize: '0.9rem', color: 'var(--text-muted)' },
    pricingFeatures: { listStyle: 'none', marginBottom: '24px' },
    pricingFeature: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 0', fontSize: '0.88rem', color: 'var(--text-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
    },
    pricingCta: {
        width: '100%', padding: '14px', background: 'var(--bg-hover)',
        color: 'var(--text-primary)', border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)', fontSize: '0.95rem', fontWeight: 700,
        cursor: 'pointer', fontFamily: 'var(--font-primary)', transition: 'all 0.3s',
    },
    paymentMethods: {
        display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', flexWrap: 'wrap',
    },
    paymentLabel: { fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 },
    paymentBadge: {
        padding: '5px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600,
    },

    /* CTA */
    ctaSection: {
        position: 'relative', padding: '100px 32px', textAlign: 'center',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        overflow: 'hidden',
    },
    ctaOrb: {
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,153,51,0.08) 0%, transparent 60%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        animation: 'float 8s ease-in-out infinite',
    },
    ctaTitle: {
        position: 'relative', fontSize: '2.4rem', fontWeight: 800,
        color: 'var(--text-primary)', marginBottom: '12px',
    },
    ctaSubtitle: {
        position: 'relative', fontSize: '1.05rem',
        color: 'var(--text-muted)', marginBottom: '32px',
    },
    ctaBtn: {
        position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '18px 44px', background: 'var(--gradient-primary)', color: '#0D0D0D',
        border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1.15rem',
        fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)',
        boxShadow: 'var(--shadow-glow-strong)', transition: 'all 0.3s',
    },

    /* Footer */
    footer: {
        borderTop: '1px solid var(--border-subtle)', padding: '40px 32px',
        background: 'var(--bg-primary)',
    },
    footerInner: {
        maxWidth: '1100px', margin: '0 auto', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    },
    footerBrand: { display: 'flex', alignItems: 'center', gap: '8px' },
    footerLogo: {
        fontSize: '1.5rem', fontFamily: 'var(--font-hindi)', fontWeight: 700,
        background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    footerName: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' },
    footerTagline: { fontSize: '0.85rem', color: 'var(--text-muted)' },
    footerLinks: { display: 'flex', gap: '16px' },
    footerLink: {
        color: 'var(--text-muted)', width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none',
    },
    footerCopy: { fontSize: '0.75rem', color: 'var(--text-muted)' },
};
