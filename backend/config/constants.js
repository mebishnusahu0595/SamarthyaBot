module.exports = {
    SUPPORTED_LANGUAGES: ['hindi', 'hinglish', 'english'],

    TOOL_PACKS: {
        student: {
            name: '🎓 Student Pack',
            nameHi: '🎓 स्टूडेंट पैक',
            tools: ['web_search', 'summarize_text', 'note_take', 'calculate', 'reminder_set', 'file_read', 'file_write', 'file_list', 'weather_info', 'run_command', 'capture_desktop_screenshot', 'schedule_background_task', 'simulate_task'],
            description: 'Assignment summary, notes, exam reminders, calculations'
        },
        business: {
            name: '🏢 Small Business Pack',
            nameHi: '🏢 बिज़नेस पैक',
            tools: ['web_search', 'send_email', 'calendar_schedule', 'gst_reminder', 'calculate', 'file_read', 'file_write', 'file_list', 'upi_generate', 'note_take', 'reminder_set', 'weather_info', 'system_info', 'run_command', 'capture_desktop_screenshot', 'schedule_background_task', 'simulate_task'],
            description: 'GST reminders, email, UPI links, file management'
        },
        developer: {
            name: '👨‍💻 Developer Pack',
            nameHi: '👨‍💻 डेवलपर पैक',
            tools: ['web_search', 'file_read', 'file_write', 'file_list', 'calculate', 'send_email', 'run_command', 'system_info', 'browser_action', 'ssh_deploy', 'note_take', 'reminder_set', 'capture_desktop_screenshot', 'schedule_background_task', 'simulate_task'],
            description: 'Shell commands, file ops, system info, browser control'
        },
        personal: {
            name: '🏠 Personal Pack',
            nameHi: '🏠 पर्सनल पैक',
            tools: ['web_search', 'reminder_set', 'note_take', 'calculate', 'weather_info', 'file_read', 'file_write', 'file_list', 'calendar_schedule', 'upi_generate', 'send_email', 'system_info', 'browser_action', 'run_command', 'capture_desktop_screenshot', 'schedule_background_task', 'simulate_task'],
            description: 'Weather, notes, reminders, UPI, email, files'
        }
    },

    PERMISSION_LEVELS: {
        ALLOW_ONCE: 'allow_once',
        ALLOW_ALWAYS: 'allow_always',
        NEVER: 'never',
        ASK: 'ask'
    },

    SENSITIVE_PATTERNS: {
        PAN: /[A-Z]{5}[0-9]{4}[A-Z]/g,
        AADHAAR: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
        PHONE: /(\+91|0)?[6-9]\d{9}/g,
        EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        BANK_ACCOUNT: /\d{9,18}/g,
        IFSC: /[A-Z]{4}0[A-Z0-9]{6}/g
    },

    INDIAN_HOLIDAYS_2025: [
        { date: '2025-01-14', name: 'Makar Sankranti', nameHi: 'मकर संक्रांति' },
        { date: '2025-01-26', name: 'Republic Day', nameHi: 'गणतंत्र दिवस' },
        { date: '2025-03-14', name: 'Holi', nameHi: 'होली' },
        { date: '2025-03-31', name: 'Eid ul-Fitr', nameHi: 'ईद उल-फ़ित्र' },
        { date: '2025-04-06', name: 'Ram Navami', nameHi: 'राम नवमी' },
        { date: '2025-04-14', name: 'Ambedkar Jayanti', nameHi: 'अंबेडकर जयंती' },
        { date: '2025-04-18', name: 'Good Friday', nameHi: 'गुड फ्राइडे' },
        { date: '2025-05-01', name: 'May Day', nameHi: 'मज़दूर दिवस' },
        { date: '2025-08-15', name: 'Independence Day', nameHi: 'स्वतंत्रता दिवस' },
        { date: '2025-08-27', name: 'Janmashtami', nameHi: 'जन्माष्टमी' },
        { date: '2025-10-02', name: 'Gandhi Jayanti', nameHi: 'गांधी जयंती' },
        { date: '2025-10-20', name: 'Dussehra', nameHi: 'दशहरा' },
        { date: '2025-11-01', name: 'Diwali', nameHi: 'दीपावली' },
        { date: '2025-11-05', name: 'Guru Nanak Jayanti', nameHi: 'गुरु नानक जयंती' },
        { date: '2025-12-25', name: 'Christmas', nameHi: 'क्रिसमस' }
    ],

    RISK_LEVELS: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical'
    }
};
