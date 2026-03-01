import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatAPI, screenAPI } from '../services/api';
import { Send, Bot, User, AlertTriangle, Loader2, Sparkles, Plus, Trash2, Pin, Mic, MicOff, Volume2, Camera, Image } from 'lucide-react';

const quickActions = [
    { emoji: '🔍', text: 'Web search karo', textEn: 'Search the web' },
    { emoji: '📝', text: 'Note likh do', textEn: 'Take a note' },
    { emoji: '🧮', text: 'Calculate karo', textEn: 'Do a calculation' },
    { emoji: '⏰', text: 'Reminder set karo', textEn: 'Set a reminder' },
    { emoji: '📅', text: 'Calendar mein add karo', textEn: 'Add to calendar' },
    { emoji: '💳', text: 'UPI link banao', textEn: 'Generate UPI link' },
];

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d) ? '' : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const groupMessagesByDate = (messagesList) => {
    const groups = {};
    messagesList.forEach(msg => {
        const d = msg.createdAt ? new Date(msg.createdAt) : new Date();
        if (isNaN(d)) return;

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        let dateStr;
        if (d.toDateString() === today.toDateString()) {
            dateStr = 'Today';
        } else if (d.toDateString() === yesterday.toDateString()) {
            dateStr = 'Yesterday';
        } else {
            dateStr = d.toLocaleDateString('en-IN', { day: 'short', month: 'short', year: 'numeric' });
        }

        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(msg);
    });
    return groups;
};

const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, lineIdx) => {
        // Simple Link Regex: [text](url)
        const parts = [];
        let remainingLine = line;
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/;
        let match;

        while ((match = linkRegex.exec(remainingLine)) !== null) {
            // Text before link
            if (match.index > 0) {
                const textBefore = remainingLine.substring(0, match.index);
                // Handle basic bold in text before
                parts.push(<span key={`t-${match.index}`}>{textBefore.replace(/\*\*/g, '')}</span>);
            }

            // The Link
            parts.push(
                <a key={`l-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#FF9933', textDecoration: 'underline', fontWeight: 'bold' }}>
                    {match[1].replace(/\*\*/g, '')}
                </a>
            );

            remainingLine = remainingLine.substring(match.index + match[0].length);
        }

        // Remaining text
        if (remainingLine.length > 0) {
            let finalText = remainingLine;
            // Handle basic bold/bullets for remaining text
            if (finalText.startsWith('- ')) {
                finalText = '• ' + finalText.substring(2);
            }
            parts.push(<span key={`end-${lineIdx}`}>{finalText.replace(/\*\*/g, '')}</span>);
        }

        return (
            <React.Fragment key={lineIdx}>
                {parts.length > 0 ? parts : <span>{line.replace(/\*\*/g, '')}</span>}
                <br />
            </React.Fragment>
        );
    });
};

export default function ChatPage({ user }) {
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [activeAlarm, setActiveAlarm] = useState(null);
    const audioContextRef = useRef(null);
    const oscillatorRef = useRef(null);

    const [voiceTranscript, setVoiceTranscript] = useState('');
    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Request Notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    const triggerAlarm = (message) => {
        const safeMsg = message || 'Reminder';
        // 1. Browser Notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⏰ Reminder from SamarthyaBot', { body: safeMsg });
        }

        // 2. Play Sound (Web Audio API)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioContextRef.current = new AudioContext();
            const osc = audioContextRef.current.createOscillator();
            const gain = audioContextRef.current.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
            // Oscillate frequency like an alarm
            setInterval(() => {
                if (oscillatorRef.current && audioContextRef.current) {
                    osc.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.3);
                }
            }, 500);

            gain.gain.value = 0.1;
            osc.connect(gain);
            gain.connect(audioContextRef.current.destination);
            osc.start();
            oscillatorRef.current = osc;
        }

        // 3. Show In-App popup
        setActiveAlarm(safeMsg);
    };

    const stopAlarm = () => {
        setActiveAlarm(null);
        if (oscillatorRef.current) {
            oscillatorRef.current.stop();
            oscillatorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    useEffect(() => {
        loadConversations();
        initVoice();
        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ===== VOICE MODE (Web Speech API) =====
    const initVoice = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        setVoiceSupported(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN'; // Hindi + Hinglish
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setVoiceTranscript(transcript);
            setInput(transcript);

            // Auto-send on final result
            if (event.results[event.results.length - 1].isFinal) {
                setTimeout(() => {
                    setIsListening(false);
                    if (transcript.trim()) {
                        sendMessage(transcript.trim());
                    }
                }, 500);
            }
        };

        recognition.onerror = (e) => {
            console.error('Voice error:', e.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    };

    const toggleVoice = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setVoiceTranscript('');
            recognitionRef.current.lang =
                user?.language === 'hindi' ? 'hi-IN' :
                    user?.language === 'english' ? 'en-IN' : 'hi-IN';
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Text-to-Speech for bot responses (Hindi)
    const speakResponse = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
        utterance.lang = user?.language === 'english' ? 'en-IN' : 'hi-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    const loadConversations = async () => {
        try {
            const res = await chatAPI.getConversations();
            setConversations(res.data.conversations || []);
        } catch (err) {
            console.error('Failed to load conversations');
        }
    };

    const loadConversation = async (id) => {
        try {
            const res = await chatAPI.getConversation(id);
            setActiveConv(res.data.conversation);
            setMessages(res.data.conversation.messages || []);
        } catch (err) {
            console.error('Failed to load conversation');
        }
    };

    const sendMessage = async (text) => {
        const messageText = text || input.trim();
        if (!messageText || loading) return;

        setInput('');
        const userMsg = { role: 'user', content: messageText, createdAt: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        setTyping(true);

        try {
            const res = await chatAPI.sendMessage({
                message: messageText,
                conversationId: activeConv?._id
            });

            const data = res.data;
            if (!activeConv) {
                setActiveConv({ _id: data.conversationId });
                loadConversations();
            }

            const assistantMsg = {
                role: 'assistant',
                content: data.message.content,
                toolCalls: data.message.toolCalls,
                sensitiveDataWarnings: data.message.sensitiveDataWarnings,
                createdAt: new Date()
            };

            setMessages(prev => [...prev, assistantMsg]);

            // Setup timeouts for any live reminders generated
            if (assistantMsg.toolCalls) {
                assistantMsg.toolCalls.forEach(tc => {
                    if (tc.toolName === 'reminder_set' && tc.notificationParams) {
                        const { delayMs, message } = tc.notificationParams;
                        setTimeout(() => {
                            triggerAlarm(message);
                        }, delayMs || 5000);
                    }
                });
            }

        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: user?.language === 'english'
                    ? '❌ Oops, an error occurred. Check the server or try again.'
                    : '❌ Arre, kuch error aa gaya. Server check karo ya dubara try karo.',
                createdAt: new Date()
            }]);
        } finally {
            setLoading(false);
            setTyping(false);
            inputRef.current?.focus();
        }
    };

    const newConversation = () => {
        setActiveConv(null);
        setMessages([]);
        inputRef.current?.focus();
    };

    const deleteConv = async (id, e) => {
        e.stopPropagation();
        try {
            await chatAPI.deleteConversation(id);
            if (activeConv?._id === id) newConversation();
            loadConversations();
        } catch (err) {
            console.error('Delete failed');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={styles.container}>
            {/* Live Alarm Popup */}
            {activeAlarm && (
                <div style={styles.alarmPopupLayer}>
                    <div style={styles.alarmBox}>
                        <div style={styles.alarmIcon}>⏰</div>
                        <div style={styles.alarmContent}>
                            <h4 style={styles.alarmTitle}>Reminder</h4>
                            <p style={styles.alarmMessage}>{activeAlarm}</p>
                        </div>
                        <button onClick={stopAlarm} style={styles.alarmStopBtn}>
                            Stop Alarm
                        </button>
                    </div>
                </div>
            )}

            {/* Conversations Sidebar */}
            <div style={styles.convSidebar}>
                <div style={styles.convHeader}>
                    <h3 style={styles.convTitle}>💬 Conversations</h3>
                    <button onClick={newConversation} style={styles.newBtn} title="New Chat">
                        <Plus size={18} />
                    </button>
                </div>
                <div style={styles.convList}>
                    {conversations.map(conv => (
                        <button
                            key={conv._id}
                            onClick={() => loadConversation(conv._id)}
                            style={{
                                ...styles.convItem,
                                ...(activeConv?._id === conv._id ? styles.convItemActive : {})
                            }}
                        >
                            <span style={styles.convItemTitle}>{conv.title}</span>
                            <div style={styles.convActions}>
                                <button onClick={(e) => deleteConv(conv._id, e)} style={styles.convDelBtn}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </button>
                    ))}
                    {conversations.length === 0 && (
                        <p style={styles.emptyConv}>
                            {user?.language === 'english'
                                ? 'No conversations found. Start a new one! 🚀'
                                : 'Koi conversation nahi. Naya shuru karo! 🚀'}
                        </p>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div style={styles.chatArea}>
                {/* Voice Listening Overlay */}
                {isListening && (
                    <div style={styles.voiceOverlay}>
                        <div style={styles.voicePulseRing}>
                            <Mic size={36} color="#FF9933" />
                        </div>
                        <p style={styles.voiceText}>
                            {voiceTranscript || (
                                user?.language === 'hindi' ? 'बोलिए...' :
                                    user?.language === 'english' ? 'Listening...' :
                                        'Bol rahe ho... sunna shuru'
                            )}
                        </p>
                        <p style={styles.voiceHint}>🎙️ Hindi, Hinglish & English voice supported</p>
                        <button onClick={toggleVoice} style={styles.voiceStopBtn}>
                            <MicOff size={18} /> Stop Listening
                        </button>
                    </div>
                )}

                {/* Messages */}
                <div style={styles.messages}>
                    {messages.length === 0 && (
                        <div style={styles.welcome}>
                            <div style={styles.welcomeLogo}>स</div>
                            <h2 style={styles.welcomeTitle}>
                                {user?.language === 'english' ? 'Hello' : 'Namaste'}, {user?.name || 'User'}! 🙏
                            </h2>
                            <p style={styles.welcomeSubtitle}>
                                {user?.language === 'english'
                                    ? 'I am SamarthyaBot, your personal AI assistant. How can I help you today?'
                                    : 'Main SamarthyaBot hoon, aapka personal AI assistant. Kaise madad kar sakta hoon?'}
                            </p>

                            <div style={styles.quickActions}>
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(user?.language === 'english' ? action.textEn : action.text)}
                                        style={styles.quickActionBtn}
                                    >
                                        <span style={styles.quickEmoji}>{action.emoji}</span>
                                        <span>{user?.language === 'english' ? action.textEn : action.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {Object.entries(groupMessagesByDate(messages)).map(([dateLabel, dateMsgs], groupIdx) => (
                        <React.Fragment key={`group-${groupIdx}`}>
                            <div style={styles.dateDivider}>
                                <span style={styles.dateBadge}>{dateLabel}</span>
                            </div>
                            {dateMsgs.map((msg, i) => (
                                <div
                                    key={`msg-${groupIdx}-${i}`}
                                    style={{
                                        ...styles.message,
                                        ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage),
                                        animation: 'fadeInUp 0.3s ease-out',
                                    }}
                                >
                                    <div style={msg.role === 'user' ? styles.userAvatar : styles.assistantAvatar}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div style={styles.messageContent}>
                                        {/* Sensitive data warnings */}
                                        {msg.sensitiveDataWarnings?.length > 0 && (
                                            <div style={styles.warningBanner}>
                                                <AlertTriangle size={14} />
                                                <span>
                                                    ⚠️ Sensitive data detected: {msg.sensitiveDataWarnings.map(w => w.type).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                        <div style={styles.messageText}>
                                            {renderFormattedText(msg.content)}
                                        </div>
                                        {/* Tool calls */}
                                        {msg.toolCalls?.length > 0 && (
                                            <div style={styles.toolCalls}>
                                                {msg.toolCalls.map((tc, k) => (
                                                    <div key={k} style={styles.toolCall}>
                                                        <div style={styles.toolCallHeader}>
                                                            <span style={{
                                                                ...styles.toolBadge,
                                                                background: tc.status === 'completed' ? 'rgba(16,185,129,0.15)' :
                                                                    tc.status === 'blocked' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                                                color: tc.status === 'completed' ? '#10b981' :
                                                                    tc.status === 'blocked' ? '#ef4444' : '#f59e0b',
                                                            }}>
                                                                {tc.status === 'completed' ? '✅' : tc.status === 'blocked' ? '🚫' : '⏳'} {tc.toolName}
                                                            </span>
                                                            <span style={styles.toolRisk}>Risk: {tc.riskLevel}</span>
                                                        </div>
                                                        {tc.result && <div style={styles.toolResult}>{renderFormattedText(tc.result)}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Message Timestamp */}
                                        <div style={{
                                            ...styles.msgTime,
                                            color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'
                                        }}>
                                            {formatTime(msg.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    ))}

                    {typing && (
                        <div style={{ ...styles.message, ...styles.assistantMessage }}>
                            <div style={styles.assistantAvatar}><Bot size={16} /></div>
                            <div style={styles.typingIndicator}>
                                <span style={{ ...styles.typingDot, animationDelay: '0s' }} />
                                <span style={{ ...styles.typingDot, animationDelay: '0.2s' }} />
                                <span style={{ ...styles.typingDot, animationDelay: '0.4s' }} />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={styles.inputArea}>
                    <div style={styles.inputWrap}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={user?.language === 'hindi' ? 'यहां टाइप करें...' :
                                user?.language === 'hinglish' ? 'Yahan type karo...' : 'Type your message...'}
                            style={styles.textarea}
                            rows={1}
                            disabled={loading}
                        />
                        {/* Screenshot / Screen Understanding Button */}
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={el => { if (el) el._screenInput = true; }}
                            id="screenInput"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setLoading(true);
                                setMessages(prev => [...prev, {
                                    role: 'user',
                                    content: `📸 Screenshot uploaded: ${file.name}`,
                                    createdAt: new Date()
                                }]);
                                setTyping(true);
                                try {
                                    const reader = new FileReader();
                                    reader.onload = async () => {
                                        const base64 = reader.result;
                                        const res = await screenAPI.analyze(
                                            base64,
                                            input.trim() || 'Is screenshot mein kya hai? Next step batao.'
                                        );
                                        setMessages(prev => [...prev, {
                                            role: 'assistant',
                                            content: `👁️ **Screen Analysis:**\n\n${res.data.analysis.content}`,
                                            createdAt: new Date()
                                        }]);
                                        setInput('');
                                    };
                                    reader.readAsDataURL(file);
                                } catch (err) {
                                    setMessages(prev => [...prev, {
                                        role: 'assistant',
                                        content: user?.language === 'english'
                                            ? '❌ Screen analysis failed. Check the Gemini API key.'
                                            : '❌ Screen analysis fail ho gaya. Gemini API key check karo.',
                                        createdAt: new Date()
                                    }]);
                                } finally {
                                    setLoading(false);
                                    setTyping(false);
                                    e.target.value = '';
                                }
                            }}
                        />
                        <button
                            onClick={() => document.getElementById('screenInput').click()}
                            style={styles.voiceBtn}
                            title="Screenshot upload for AI analysis"
                        >
                            <Camera size={20} />
                        </button>
                        {/* Voice Button */}
                        {voiceSupported && (
                            <button
                                onClick={toggleVoice}
                                style={{
                                    ...styles.voiceBtn,
                                    ...(isListening ? styles.voiceBtnActive : {})
                                }}
                                title="Voice input (Hindi/English)"
                            >
                                <Mic size={20} />
                            </button>
                        )}
                        <button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            style={{
                                ...styles.sendBtn,
                                opacity: (loading || !input.trim()) ? 0.5 : 1,
                            }}
                        >
                            {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={20} />}
                        </button>
                    </div>
                    <p style={styles.inputHint}>
                        🇮🇳 Hindi, Hinglish & English supported • Enter to send • Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        background: 'var(--bg-primary)',
    },

    // Live Alarm UI
    alarmPopupLayer: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    alarmBox: {
        background: 'rgba(20, 20, 35, 0.95)',
        border: '2px solid rgba(255, 107, 0, 0.5)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        maxWidth: '400px',
        textAlign: 'center',
        animation: 'pulseAlarm 1s infinite alternate'
    },
    alarmIcon: {
        fontSize: '4rem',
        animation: 'ringAlarm 0.5s infinite alternate'
    },
    alarmTitle: {
        fontSize: '1.4rem',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        margin: 0
    },
    alarmMessage: {
        fontSize: '1.1rem',
        color: 'var(--text-secondary)',
        margin: 0
    },
    alarmStopBtn: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
        transition: 'all 0.2s ease',
    },

    convSidebar: {
        width: '280px',
        minWidth: '200px',
        maxWidth: '500px',
        resize: 'horizontal',
        overflowX: 'hidden',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
    },
    convHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid var(--border-subtle)',
    },
    convTitle: {
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
    },
    newBtn: {
        width: '34px',
        height: '34px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-primary)',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--transition-fast)',
    },
    convList: {
        flex: 1,
        overflow: 'auto',
        padding: '8px',
    },
    convItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '12px',
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-primary)',
        textAlign: 'left',
        transition: 'all var(--transition-fast)',
        marginBottom: '2px',
    },
    convItemActive: {
        background: 'rgba(255, 153, 51, 0.1)',
        color: 'var(--text-primary)',
    },
    convItemTitle: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
    },
    convActions: {
        display: 'flex',
        gap: '4px',
        flexShrink: 0,
    },
    convDelBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        transition: 'all var(--transition-fast)',
    },
    emptyConv: {
        padding: '20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
    },
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
    },
    messages: {
        flex: 1,
        overflow: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    welcome: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        textAlign: 'center',
        padding: '40px 20px',
        animation: 'fadeInUp 0.6s ease-out',
    },
    welcomeLogo: {
        fontSize: '4rem',
        fontFamily: 'var(--font-hindi)',
        fontWeight: 700,
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px',
        animation: 'float 4s ease-in-out infinite',
    },
    welcomeTitle: {
        fontSize: '1.8rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    welcomeSubtitle: {
        fontSize: '1rem',
        color: 'var(--text-muted)',
        marginBottom: '32px',
        maxWidth: '500px',
        fontFamily: 'var(--font-primary)',
    },
    dateDivider: {
        display: 'flex',
        justifyContent: 'center',
        margin: '16px 0',
        width: '100%',
    },
    dateBadge: {
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        padding: '4px 12px',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
    },
    quickActions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '10px',
        maxWidth: '680px',
        width: '100%',
    },
    quickActionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-primary)',
        transition: 'all var(--transition-fast)',
        textAlign: 'left',
    },
    quickEmoji: {
        fontSize: '1.2rem',
    },
    message: {
        display: 'flex',
        gap: '12px',
        maxWidth: '85%',
        animation: 'fadeIn 0.3s ease-out',
    },
    userMessage: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    assistantMessage: {
        alignSelf: 'flex-start',
    },
    userAvatar: {
        width: '34px',
        height: '34px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-saffron)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        flexShrink: 0,
    },
    assistantAvatar: {
        width: '34px',
        height: '34px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        flexShrink: 0,
    },
    messageContent: {
        maxWidth: '100%',
    },
    messageText: {
        padding: '14px 18px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        lineHeight: 1.7,
        wordBreak: 'break-word',
    },
    warningBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-sm)',
        color: '#f59e0b',
        fontSize: '0.8rem',
        marginBottom: '8px',
    },
    msgTime: {
        fontSize: '0.7rem',
        textAlign: 'right',
        marginTop: '4px',
        fontWeight: '500',
    },
    toolCalls: {
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    toolCall: {
        padding: '10px 14px',
        background: 'rgba(99, 102, 241, 0.06)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.8rem',
    },
    toolCallHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px',
    },
    toolBadge: {
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: 600,
    },
    toolRisk: {
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
    },
    toolResult: {
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
    },
    typingIndicator: {
        display: 'flex',
        gap: '6px',
        padding: '14px 18px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
    },
    typingDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'var(--accent-primary)',
        animation: 'typing 1.4s ease-in-out infinite',
        display: 'inline-block',
    },
    inputArea: {
        padding: '16px 24px 20px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
    },
    inputWrap: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        padding: '6px 6px 6px 18px',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        transition: 'all var(--transition-normal)',
    },
    textarea: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-primary)',
        fontSize: '0.95rem',
        padding: '10px 0',
        resize: 'none',
        outline: 'none',
        maxHeight: '120px',
        lineHeight: 1.5,
    },
    sendBtn: {
        width: '42px',
        height: '42px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-primary)',
        border: 'none',
        color: '#0D0D0D',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--transition-fast)',
        flexShrink: 0,
    },
    voiceBtn: {
        width: '42px',
        height: '42px',
        borderRadius: 'var(--radius-md)',
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--transition-fast)',
        flexShrink: 0,
    },
    voiceBtnActive: {
        background: 'rgba(255, 153, 51, 0.15)',
        borderColor: 'var(--accent-saffron)',
        color: 'var(--accent-saffron)',
        animation: 'voicePulse 1.5s infinite',
    },
    voiceOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(13, 13, 13, 0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        animation: 'fadeIn 0.3s ease-out',
        gap: '16px',
    },
    voicePulseRing: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(255, 153, 51, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'voicePulse 1.5s infinite',
    },
    voiceText: {
        fontSize: '1.2rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        maxWidth: '400px',
        textAlign: 'center',
    },
    voiceHint: {
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
    },
    voiceStopBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 24px',
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-md)',
        color: '#ef4444',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-primary)',
    },
    speakBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        marginTop: '6px',
        fontSize: '0.72rem',
        gap: '4px',
        transition: 'all 0.2s',
    },
    inputHint: {
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginTop: '8px',
    }
};
