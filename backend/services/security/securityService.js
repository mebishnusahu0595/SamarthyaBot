const { SENSITIVE_PATTERNS } = require('../../config/constants');

class SecurityService {
    /**
     * Scan text for sensitive Indian data patterns (PAN, Aadhaar, Phone, etc.)
     */
    scanForSensitiveData(text) {
        const findings = [];

        if (!text || typeof text !== 'string') return findings;

        // PAN Card
        const panMatches = text.match(SENSITIVE_PATTERNS.PAN);
        if (panMatches) {
            findings.push({
                type: 'PAN Card',
                typeHi: 'पैन कार्ड',
                count: panMatches.length,
                risk: 'high',
                icon: '🔴',
                message: `${panMatches.length} PAN number(s) detected`,
                messageHi: `${panMatches.length} पैन नंबर मिला`
            });
        }

        // Aadhaar
        const aadhaarMatches = text.match(SENSITIVE_PATTERNS.AADHAAR);
        if (aadhaarMatches) {
            findings.push({
                type: 'Aadhaar Number',
                typeHi: 'आधार नंबर',
                count: aadhaarMatches.length,
                risk: 'critical',
                icon: '🔴',
                message: `${aadhaarMatches.length} Aadhaar number(s) detected`,
                messageHi: `${aadhaarMatches.length} आधार नंबर मिला`
            });
        }

        // Phone Numbers
        const phoneMatches = text.match(SENSITIVE_PATTERNS.PHONE);
        if (phoneMatches) {
            findings.push({
                type: 'Phone Number',
                typeHi: 'फ़ोन नंबर',
                count: phoneMatches.length,
                risk: 'medium',
                icon: '🟡',
                message: `${phoneMatches.length} phone number(s) detected`,
                messageHi: `${phoneMatches.length} फ़ोन नंबर मिला`
            });
        }

        // Email
        const emailMatches = text.match(SENSITIVE_PATTERNS.EMAIL);
        if (emailMatches) {
            findings.push({
                type: 'Email Address',
                typeHi: 'ईमेल',
                count: emailMatches.length,
                risk: 'low',
                icon: '🟢',
                message: `${emailMatches.length} email address(es) detected`,
                messageHi: `${emailMatches.length} ईमेल मिला`
            });
        }

        // IFSC Code
        const ifscMatches = text.match(SENSITIVE_PATTERNS.IFSC);
        if (ifscMatches) {
            findings.push({
                type: 'IFSC Code',
                typeHi: 'IFSC कोड',
                count: ifscMatches.length,
                risk: 'high',
                icon: '🔴',
                message: `${ifscMatches.length} IFSC code(s) detected`,
                messageHi: `${ifscMatches.length} IFSC कोड मिला`
            });
        }

        return findings;
    }

    /**
     * Mask sensitive data in text
     * Preserves UPI IDs and UPI links (phone numbers inside UPI should NOT be masked)
     */
    maskSensitiveData(text) {
        if (!text) return text;
        let masked = text;

        // Step 1: Temporarily protect UPI links and UPI IDs from masking
        const upiPlaceholders = [];
        // Protect full UPI deep links: upi://pay?pa=...
        masked = masked.replace(/upi:\/\/pay\?[^\s\n`"')]+/gi, (match) => {
            const idx = upiPlaceholders.length;
            upiPlaceholders.push(match);
            return `__UPI_LINK_${idx}__`;
        });
        // Protect UPI IDs: something@upihandle (e.g. 9301105706@yespop)
        masked = masked.replace(/[\w.\-+]+@[a-zA-Z]{2,}/g, (match) => {
            // Only protect if it looks like a UPI ID (ends with known UPI handles or short handle)
            const upiHandles = ['ybl', 'okhdfcbank', 'okicici', 'okaxis', 'oksbi', 'paytm',
                'apl', 'yespop', 'upi', 'ibl', 'sbi', 'axisbank', 'icici', 'hdfcbank',
                'kotak', 'pnb', 'boi', 'cnrb', 'unionbank', 'indianbank', 'federal'];
            const handle = match.split('@')[1]?.toLowerCase();
            if (handle && (upiHandles.includes(handle) || handle.length <= 6)) {
                const idx = upiPlaceholders.length;
                upiPlaceholders.push(match);
                return `__UPI_LINK_${idx}__`;
            }
            return match; // Not a UPI ID, leave for email detection
        });

        // Step 2: Apply masking
        masked = masked.replace(SENSITIVE_PATTERNS.PAN, (match) => match.substring(0, 2) + '***' + match.substring(match.length - 2));
        masked = masked.replace(SENSITIVE_PATTERNS.AADHAAR, (match) => 'XXXX XXXX ' + match.trim().slice(-4));
        masked = masked.replace(SENSITIVE_PATTERNS.PHONE, (match) => match.substring(0, 4) + '****' + match.substring(match.length - 2));

        // Step 3: Restore protected UPI content
        for (let i = 0; i < upiPlaceholders.length; i++) {
            masked = masked.replace(`__UPI_LINK_${i}__`, upiPlaceholders[i]);
        }

        return masked;
    }

    /**
     * Assess risk level of a tool action
     */
    assessRisk(toolName, args) {
        const highRiskTools = ['file_delete', 'send_email', 'browser_automation'];
        const mediumRiskTools = ['file_write', 'calendar_schedule'];
        const lowRiskTools = ['web_search', 'calculate', 'weather_info', 'summarize_text', 'note_take'];

        if (highRiskTools.includes(toolName)) return 'high';
        if (mediumRiskTools.includes(toolName)) return 'medium';
        if (lowRiskTools.includes(toolName)) return 'low';
        return 'medium';
    }

    /**
     * Check if action requires user permission
     */
    requiresPermission(toolName, userPermissions) {
        const toolPermissionMap = {
            'file_read': 'fileAccess',
            'file_write': 'fileAccess',
            'file_delete': 'fileAccess',
            'send_email': 'emailAccess',
            'browser_automation': 'browserAccess',
            'calendar_schedule': 'calendarAccess'
        };

        const permKey = toolPermissionMap[toolName];
        if (!permKey) return false;

        const perm = userPermissions?.[permKey] || 'ask';
        if (perm === 'allow_always') return false;
        if (perm === 'never') return 'blocked';
        return true;
    }
}

module.exports = new SecurityService();
