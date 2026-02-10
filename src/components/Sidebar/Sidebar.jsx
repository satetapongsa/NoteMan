import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Plus, Folder, Tag, Star, Clock,
    ChevronRight, ChevronDown, MoreVertical, Trash2, Edit2,
    Heart, FileText
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import { useUIStore } from '../../store/useUIStore';
import { Button } from '../UI/Button';
import './Sidebar.css';

export const Sidebar = () => {
    const {
        notes,
        folders,
        tags,
        currentNote,
        setCurrentNote,
        createNote,
        createFolder,
        deleteNote,
        toggleFavorite,
        searchQuery,
        setSearchQuery,
        getFilteredNotes,
        getFavoriteNotes,
        getRecentNotes,
    } = useNotesStore();

    const { sidebarOpen, addToast } = useUIStore();
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const filteredNotes = getFilteredNotes();
    const favoriteNotes = getFavoriteNotes();
    const recentNotes = getRecentNotes(5);

    const handleCreateNote = async () => {
        const note = await createNote({
            title: 'Untitled Note',
            content: '',
        });
        if (note) {
            addToast({
                type: 'success',
                message: 'New note created',
            });
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        const folder = await createFolder(newFolderName);
        if (folder) {
            addToast({
                type: 'success',
                message: 'Folder created',
            });
            setNewFolderName('');
            setShowNewFolderInput(false);
        }
    };

    const toggleFolder = (folderId) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const handleDeleteNote = async (noteId, e) => {
        e.stopPropagation();
        if (window.confirm('Delete this note?')) {
            const success = await deleteNote(noteId);
            if (success) {
                addToast({
                    type: 'success',
                    message: 'Note deleted',
                });
            }
        }
    };

    const handleToggleFavorite = async (noteId, e) => {
        e.stopPropagation();
        await toggleFavorite(noteId);
    };

    if (!sidebarOpen) return null;

    return (
        <motion.aside
            className="sidebar"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
            {/* Header */}
            <div className="sidebar-header">
                <h2 className="sidebar-title gradient-text">NoteFlow</h2>
                <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus size={16} />}
                    onClick={handleCreateNote}
                >
                    New
                </Button>
            </div>

            {/* Search */}
            <div className="sidebar-search">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Quick Access */}
            <div className="sidebar-section">
                <div className="section-title">Quick Access</div>
                <div className="quick-links">
                    <button className="quick-link">
                        <Heart size={16} />
                        <span>Favorites</span>
                        <span className="count">{favoriteNotes.length}</span>
                    </button>
                    <button className="quick-link">
                        <Clock size={16} />
                        <span>Recent</span>
                        <span className="count">{recentNotes.length}</span>
                    </button>
                </div>
            </div>

            {/* Folders */}
            <div className="sidebar-section">
                <div className="section-header">
                    <div className="section-title">Folders</div>
                    <button
                        className="icon-btn"
                        onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {showNewFolderInput && (
                    <div className="new-folder-input">
                        <input
                            type="text"
                            placeholder="Folder name..."
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                            autoFocus
                        />
                        <Button size="sm" onClick={handleCreateFolder}>
                            Create
                        </Button>
                    </div>
                )}

                <div className="folder-list">
                    {folders.map((folder) => (
                        <div key={folder.id} className="folder-item">
                            <button
                                className="folder-header"
                                onClick={() => toggleFolder(folder.id)}
                            >
                                {expandedFolders.has(folder.id) ? (
                                    <ChevronDown size={16} />
                                ) : (
                                    <ChevronRight size={16} />
                                )}
                                <Folder size={16} />
                                <span>{folder.name}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tags */}
            {tags.size > 0 && (
                <div className="sidebar-section">
                    <div className="section-title">Tags</div>
                    <div className="tag-cloud">
                        {Array.from(tags).map((tag) => (
                            <button key={tag} className="tag-item">
                                <Tag size={12} />
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes List */}
            <div className="sidebar-section flex-1">
                <div className="section-title">
                    All Notes ({filteredNotes.length})
                </div>
                <div className="notes-list">
                    {filteredNotes.map((note) => (
                        <motion.div
                            key={note.id}
                            className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
                            onClick={() => setCurrentNote(note)}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="note-item-header">
                                <h4 className="note-item-title">{note.title}</h4>
                                <div className="note-item-actions">
                                    <button
                                        className={`note-item-favorite ${note.favorite ? 'active' : ''}`}
                                        onClick={(e) => handleToggleFavorite(note.id, e)}
                                    >
                                        <Heart size={14} fill={note.favorite ? 'currentColor' : 'none'} />
                                    </button>
                                    <button
                                        className="note-item-delete"
                                        onClick={(e) => handleDeleteNote(note.id, e)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <p className="note-item-preview">
                                {note.content.substring(0, 80)}
                                {note.content.length > 80 ? '...' : ''}
                            </p>
                            <div className="note-item-meta">
                                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                                {note.tags?.length > 0 && (
                                    <div className="note-item-tags">
                                        {note.tags.slice(0, 2).map((tag) => (
                                            <span key={tag} className="mini-tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {filteredNotes.length === 0 && (
                        <div className="empty-state">
                            <FileText size={48} className="empty-icon" />
                            <p>No notes found</p>
                            <Button size="sm" onClick={handleCreateNote}>
                                Create your first note
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};
