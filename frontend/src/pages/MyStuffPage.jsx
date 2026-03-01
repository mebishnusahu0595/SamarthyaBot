import React, { useState, useEffect, useRef } from 'react';
import {
    Folder, File, FileText, FileImage, FileCode, Download, Trash2,
    FolderPlus, Upload, ArrowLeft, RefreshCw, HardDrive, ChevronRight, Eye, X
} from 'lucide-react';
import { filesAPI } from '../services/api';

const FILE_ICONS = {
    folder: { icon: Folder, color: '#FF9933' },
    txt: { icon: FileText, color: '#94a3b8' },
    md: { icon: FileText, color: '#60a5fa' },
    json: { icon: FileCode, color: '#fbbf24' },
    js: { icon: FileCode, color: '#fbbf24' },
    html: { icon: FileCode, color: '#f97316' },
    css: { icon: FileCode, color: '#38bdf8' },
    png: { icon: FileImage, color: '#a78bfa' },
    jpg: { icon: FileImage, color: '#a78bfa' },
    jpeg: { icon: FileImage, color: '#a78bfa' },
    pdf: { icon: File, color: '#ef4444' },
    default: { icon: File, color: '#64748b' }
};

function getFileIcon(item) {
    if (item.type === 'folder') return FILE_ICONS.folder;
    return FILE_ICONS[item.extension] || FILE_ICONS.default;
}

function formatSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(date) {
    return new Date(date).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
        year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

export default function MyStuffPage({ user }) {
    const [items, setItems] = useState([]);
    const [currentPath, setCurrentPath] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => { loadFiles(); loadStats(); }, [currentPath]);

    const loadFiles = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await filesAPI.list(currentPath);
            setItems(res.data.items || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load files');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const res = await filesAPI.getStats();
            setStats(res.data.stats);
        } catch (e) { /* ignore */ }
    };

    const navigateTo = (item) => {
        if (item.type === 'folder') {
            setCurrentPath(item.path);
        } else {
            openPreview(item);
        }
    };

    const goBack = () => {
        const parts = currentPath.split('/');
        parts.pop();
        setCurrentPath(parts.join('/'));
    };

    const openPreview = async (item) => {
        try {
            const res = await filesAPI.read(item.path);
            setPreview(res.data);
        } catch (err) {
            setError('Cannot preview this file');
        }
    };

    const downloadFile = (item) => {
        const url = filesAPI.download(item.path);
        window.open(url, '_blank');
    };

    const deleteItem = async (item) => {
        const confirmMsg = item.type === 'folder'
            ? `Delete folder "${item.name}" and all its contents?`
            : `Delete file "${item.name}"?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await filesAPI.deleteFile(item.path);
            loadFiles();
            loadStats();
        } catch (err) {
            setError(err.response?.data?.error || 'Delete failed');
        }
    };

    const createFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await filesAPI.mkdir(newFolderName.trim(), currentPath);
            setNewFolderName('');
            setShowNewFolder(false);
            loadFiles();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create folder');
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                await filesAPI.upload(file.name, reader.result, currentPath);
                loadFiles();
                loadStats();
            } catch (err) {
                setError(err.response?.data?.error || 'Upload failed');
            }
        };

        if (file.type.startsWith('text/') || ['application/json', 'application/javascript'].includes(file.type)) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const breadcrumbs = ['My Stuff', ...currentPath.split('/').filter(Boolean)];

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <HardDrive size={24} color="#FF9933" />
                    <h1 style={styles.title}>My Stuff</h1>
                    {stats && (
                        <span style={styles.statsTag}>
                            {stats.fileCount} files · {stats.folderCount} folders · {stats.totalSizeFormatted}
                        </span>
                    )}
                </div>
                <div style={styles.headerActions}>
                    <button onClick={() => setShowNewFolder(true)} style={styles.actionBtn}>
                        <FolderPlus size={16} /> New Folder
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} style={styles.actionBtn}>
                        <Upload size={16} /> Upload
                    </button>
                    <button onClick={loadFiles} style={styles.actionBtnIcon}>
                        <RefreshCw size={16} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
                {breadcrumbs.map((crumb, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <ChevronRight size={14} color="#64748b" />}
                        <button
                            onClick={() => {
                                if (i === 0) setCurrentPath('');
                                else {
                                    const path = currentPath.split('/').slice(0, i).join('/');
                                    setCurrentPath(path);
                                }
                            }}
                            style={{
                                ...styles.crumbItem,
                                color: i === breadcrumbs.length - 1 ? '#FF9933' : '#94a3b8'
                            }}
                        >
                            {crumb}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {/* New Folder Input */}
            {showNewFolder && (
                <div style={styles.newFolderRow}>
                    <FolderPlus size={18} color="#FF9933" />
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && createFolder()}
                        placeholder="Folder name..."
                        style={styles.newFolderInput}
                        autoFocus
                    />
                    <button onClick={createFolder} style={styles.newFolderOk}>Create</button>
                    <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} style={styles.newFolderCancel}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={styles.error}>
                    ❌ {error}
                    <button onClick={() => setError('')} style={styles.errorClose}>×</button>
                </div>
            )}

            {/* Back button */}
            {currentPath && (
                <button onClick={goBack} style={styles.backBtn}>
                    <ArrowLeft size={16} /> Back
                </button>
            )}

            {/* File List */}
            {loading ? (
                <div style={styles.loadingBox}>Loading...</div>
            ) : items.length === 0 ? (
                <div style={styles.emptyBox}>
                    <Folder size={48} color="#333" />
                    <p style={styles.emptyText}>This folder is empty</p>
                    <p style={styles.emptyHint}>
                        Upload a file or ask SamarthyaBot to create one in chat!
                    </p>
                </div>
            ) : (
                <div style={styles.fileGrid}>
                    {items.map((item, i) => {
                        const iconInfo = getFileIcon(item);
                        const Icon = iconInfo.icon;
                        return (
                            <div
                                key={i}
                                style={styles.fileCard}
                                onDoubleClick={() => navigateTo(item)}
                            >
                                <div style={styles.fileCardTop} onClick={() => navigateTo(item)}>
                                    <Icon size={32} color={iconInfo.color} />
                                    <div style={styles.fileInfo}>
                                        <span style={styles.fileName}>{item.name}</span>
                                        <span style={styles.fileMeta}>
                                            {item.type === 'folder' ? 'Folder' : formatSize(item.size)}
                                            {item.modified && ` · ${formatDate(item.modified)}`}
                                        </span>
                                    </div>
                                </div>
                                <div style={styles.fileActions}>
                                    {item.type === 'file' && (
                                        <>
                                            <button onClick={() => openPreview(item)} style={styles.fileActionBtn} title="Preview">
                                                <Eye size={14} />
                                            </button>
                                            <button onClick={() => downloadFile(item)} style={styles.fileActionBtn} title="Download">
                                                <Download size={14} />
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => deleteItem(item)} style={{ ...styles.fileActionBtn, ...styles.deleteBtn }} title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Preview Modal */}
            {preview && (
                <div style={styles.modalOverlay} onClick={() => setPreview(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                <FileText size={18} color="#FF9933" />
                                {preview.name}
                            </h3>
                            <span style={styles.modalMeta}>
                                {formatSize(preview.size)} · {preview.extension?.toUpperCase()}
                            </span>
                            <button onClick={() => setPreview(null)} style={styles.modalClose}>
                                <X size={20} />
                            </button>
                        </div>
                        <pre style={styles.previewContent}>{preview.content}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    title: { fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 },
    statsTag: { fontSize: '12px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px' },
    headerActions: { display: 'flex', gap: '8px' },
    actionBtn: {
        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
        background: 'rgba(255,153,51,0.1)', border: '1px solid rgba(255,153,51,0.3)',
        borderRadius: '8px', color: '#FF9933', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
        transition: 'all 0.2s'
    },
    actionBtnIcon: {
        display: 'flex', alignItems: 'center', padding: '8px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s'
    },
    breadcrumb: {
        display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px',
        padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
        borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)'
    },
    crumbItem: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px 4px', borderRadius: '4px' },
    newFolderRow: {
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
        padding: '10px 14px', background: 'rgba(255,153,51,0.05)',
        border: '1px solid rgba(255,153,51,0.2)', borderRadius: '8px'
    },
    newFolderInput: {
        flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '13px', outline: 'none'
    },
    newFolderOk: {
        padding: '6px 14px', background: '#FF9933', border: 'none',
        borderRadius: '6px', color: '#000', fontWeight: '600', cursor: 'pointer', fontSize: '12px'
    },
    newFolderCancel: {
        padding: '6px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer'
    },
    error: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
        color: '#ef4444', fontSize: '13px', marginBottom: '12px'
    },
    errorClose: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' },
    backBtn: {
        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px',
        padding: '6px 12px', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
        color: '#94a3b8', cursor: 'pointer', fontSize: '13px'
    },
    loadingBox: { textAlign: 'center', color: '#64748b', padding: '60px 0', fontSize: '14px' },
    emptyBox: { textAlign: 'center', padding: '60px 0' },
    emptyText: { color: '#64748b', fontSize: '16px', margin: '12px 0 4px' },
    emptyHint: { color: '#4a5568', fontSize: '13px' },
    fileGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' },
    fileCard: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
        transition: 'all 0.15s', cursor: 'pointer'
    },
    fileCardTop: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 },
    fileInfo: { display: 'flex', flexDirection: 'column', minWidth: 0 },
    fileName: { fontSize: '14px', color: '#e2e8f0', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    fileMeta: { fontSize: '11px', color: '#64748b' },
    fileActions: { display: 'flex', gap: '4px', flexShrink: 0 },
    fileActionBtn: {
        padding: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.15s'
    },
    deleteBtn: { color: '#ef4444' },
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    },
    modal: {
        width: '90%', maxWidth: '800px', maxHeight: '80vh',
        background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
    },
    modalHeader: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.03)'
    },
    modalTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#fff', margin: 0, flex: 1 },
    modalMeta: { fontSize: '12px', color: '#64748b' },
    modalClose: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' },
    previewContent: {
        padding: '16px 20px', margin: 0, overflow: 'auto', flex: 1,
        fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace',",
        whiteSpace: 'pre-wrap', wordBreak: 'break-word'
    }
};
