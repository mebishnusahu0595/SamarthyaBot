const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const os = require('os');

const BASE_DIR = path.join(os.homedir(), 'SamarthyaBot_Files');

/**
 * Get user's sandboxed directory
 */
function getUserDir(userId) {
    return path.join(BASE_DIR, String(userId));
}

/**
 * Ensure user directory exists
 */
async function ensureUserDir(userId) {
    const userDir = getUserDir(userId);
    await fs.mkdir(userDir, { recursive: true });
    // Create default subdirectories
    await fs.mkdir(path.join(userDir, 'notes'), { recursive: true });
    await fs.mkdir(path.join(userDir, 'reminders'), { recursive: true });
    await fs.mkdir(path.join(userDir, 'calendar'), { recursive: true });
    await fs.mkdir(path.join(userDir, 'downloads'), { recursive: true });
    return userDir;
}

/**
 * Validate path is within user's sandbox
 */
function validatePath(userDir, requestedPath) {
    const resolved = path.resolve(userDir, requestedPath || '');
    if (!resolved.startsWith(userDir)) {
        throw new Error('Access denied: Path outside sandbox');
    }
    return resolved;
}

/**
 * GET /api/files/list — List files and folders
 */
exports.listFiles = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userDir = await ensureUserDir(userId);
        const subPath = req.query.path || '';
        const fullPath = validatePath(userDir, subPath);

        const entries = await fs.readdir(fullPath, { withFileTypes: true });
        const items = [];

        for (const entry of entries) {
            const entryPath = path.join(fullPath, entry.name);
            try {
                const stat = await fs.stat(entryPath);
                items.push({
                    name: entry.name,
                    type: entry.isDirectory() ? 'folder' : 'file',
                    size: entry.isDirectory() ? null : stat.size,
                    modified: stat.mtime,
                    extension: entry.isDirectory() ? null : path.extname(entry.name).slice(1).toLowerCase(),
                    path: subPath ? `${subPath}/${entry.name}` : entry.name
                });
            } catch (e) {
                // Skip inaccessible
            }
        }

        // Sort: folders first, then alphabetical
        items.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        res.json({
            success: true,
            currentPath: subPath || '/',
            items,
            totalItems: items.length
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * GET /api/files/read — Read file contents (text only)
 */
exports.readFile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userDir = await ensureUserDir(userId);
        const filePath = validatePath(userDir, req.query.path);

        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            return res.status(400).json({ success: false, error: 'Cannot read a directory' });
        }
        if (stat.size > 2 * 1024 * 1024) {
            return res.status(400).json({ success: false, error: 'File too large (max 2MB for preview)' });
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const ext = path.extname(filePath).slice(1).toLowerCase();

        res.json({
            success: true,
            name: path.basename(filePath),
            content,
            size: stat.size,
            extension: ext,
            modified: stat.mtime
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * GET /api/files/download — Download a file
 */
exports.downloadFile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userDir = await ensureUserDir(userId);
        const filePath = validatePath(userDir, req.query.path);

        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            return res.status(400).json({ success: false, error: 'Cannot download a directory' });
        }

        res.download(filePath, path.basename(filePath));
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/files/mkdir — Create a folder
 */
exports.createFolder = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userDir = await ensureUserDir(userId);
        const { name, parentPath } = req.body;

        if (!name || /[/\\<>:|?*"]/.test(name)) {
            return res.status(400).json({ success: false, error: 'Invalid folder name' });
        }

        const folderPath = validatePath(userDir, parentPath ? `${parentPath}/${name}` : name);
        await fs.mkdir(folderPath, { recursive: true });

        res.json({ success: true, message: `Folder "${name}" created`, path: parentPath ? `${parentPath}/${name}` : name });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * DELETE /api/files/delete — Delete a file or empty folder
 */
exports.deleteFile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userDir = await ensureUserDir(userId);
        const filePath = validatePath(userDir, req.query.path);

        // Prevent deleting root
        if (filePath === userDir) {
            return res.status(400).json({ success: false, error: 'Cannot delete root directory' });
        }

        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            await fs.rm(filePath, { recursive: true });
        } else {
            await fs.unlink(filePath);
        }

        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/files/upload — Upload a file
 */
exports.uploadFile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userDir = await ensureUserDir(userId);
        const { filename, content, parentPath } = req.body;

        if (!filename || !content) {
            return res.status(400).json({ success: false, error: 'Filename and content required' });
        }

        const safeName = filename.replace(/[/\\<>:|?*"]/g, '_');
        const filePath = validatePath(userDir, parentPath ? `${parentPath}/${safeName}` : safeName);

        // Handle base64 content (for binary files)
        if (content.startsWith('data:')) {
            const base64Data = content.split(',')[1];
            await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'));
        } else {
            await fs.writeFile(filePath, content, 'utf-8');
        }

        const stat = await fs.stat(filePath);
        res.json({
            success: true,
            message: `File "${safeName}" uploaded`,
            size: stat.size,
            path: parentPath ? `${parentPath}/${safeName}` : safeName
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * GET /api/files/stats — Get storage stats
 */
exports.getStats = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userDir = await ensureUserDir(userId);

        let totalSize = 0;
        let fileCount = 0;
        let folderCount = 0;

        async function walk(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    folderCount++;
                    await walk(fullPath);
                } else {
                    fileCount++;
                    const stat = await fs.stat(fullPath);
                    totalSize += stat.size;
                }
            }
        }

        await walk(userDir);

        res.json({
            success: true,
            stats: {
                totalSize,
                totalSizeFormatted: totalSize < 1024 ? `${totalSize} B` :
                    totalSize < 1048576 ? `${(totalSize / 1024).toFixed(1)} KB` :
                        `${(totalSize / 1048576).toFixed(1)} MB`,
                fileCount,
                folderCount
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
