import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Bold, Italic, Underline, Strikethrough, Code, Link,
    List, ListOrdered, Quote, Heading1, Heading2, Heading3,
    AlignLeft, AlignCenter, AlignRight, Image as ImageIcon,
    Table, CheckSquare, Save, Check, Loader
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import './RichTextEditor.css';

export const RichTextEditor = () => {
    const { currentNote, autoSave, isSaving, lastSaved } = useNotesStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const contentRef = useRef(null);

    useEffect(() => {
        if (currentNote) {
            setTitle(currentNote.title);
            setContent(currentNote.content);
        }
    }, [currentNote]);

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (currentNote) {
            autoSave(currentNote.id, { title: newTitle });
        }
    };

    const handleContentChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);
        if (currentNote) {
            autoSave(currentNote.id, { content: newContent });
        }
    };

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        contentRef.current?.focus();
    };

    const toolbarButtons = [
        { icon: <Bold size={18} />, command: 'bold', label: 'Bold (Ctrl+B)' },
        { icon: <Italic size={18} />, command: 'italic', label: 'Italic (Ctrl+I)' },
        { icon: <Underline size={18} />, command: 'underline', label: 'Underline (Ctrl+U)' },
        { icon: <Strikethrough size={18} />, command: 'strikeThrough', label: 'Strikethrough' },
        { type: 'separator' },
        { icon: <Heading1 size={18} />, command: 'formatBlock', value: 'h1', label: 'Heading 1' },
        { icon: <Heading2 size={18} />, command: 'formatBlock', value: 'h2', label: 'Heading 2' },
        { icon: <Heading3 size={18} />, command: 'formatBlock', value: 'h3', label: 'Heading 3' },
        { type: 'separator' },
        { icon: <List size={18} />, command: 'insertUnorderedList', label: 'Bullet List' },
        { icon: <ListOrdered size={18} />, command: 'insertOrderedList', label: 'Numbered List' },
        { icon: <Quote size={18} />, command: 'formatBlock', value: 'blockquote', label: 'Quote' },
        { type: 'separator' },
        { icon: <AlignLeft size={18} />, command: 'justifyLeft', label: 'Align Left' },
        { icon: <AlignCenter size={18} />, command: 'justifyCenter', label: 'Align Center' },
        { icon: <AlignRight size={18} />, command: 'justifyRight', label: 'Align Right' },
        { type: 'separator' },
        { icon: <Code size={18} />, command: 'formatBlock', value: 'pre', label: 'Code Block' },
        { icon: <Link size={18} />, command: 'createLink', label: 'Insert Link' },
    ];

    const getSaveStatus = () => {
        if (isSaving) {
            return (
                <div className="save-status saving">
                    <Loader size={14} className="spin" />
                    <span>Saving...</span>
                </div>
            );
        }
        if (lastSaved) {
            const secondsAgo = Math.floor((Date.now() - lastSaved) / 1000);
            let timeText = 'just now';
            if (secondsAgo >= 60) {
                const minutesAgo = Math.floor(secondsAgo / 60);
                timeText = `${minutesAgo}m ago`;
            } else if (secondsAgo > 5) {
                timeText = `${secondsAgo}s ago`;
            }
            return (
                <div className="save-status saved">
                    <Check size={14} />
                    <span>Saved {timeText}</span>
                </div>
            );
        }
        return null;
    };

    if (!currentNote) {
        return (
            <div className="editor-empty-state">
                <div className="empty-state-content">
                    <div className="empty-icon">
                        <FileText size={64} />
                    </div>
                    <h2>Select a note to start editing</h2>
                    <p>Or create a new note to get started</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="rich-text-editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Toolbar */}
            <div className="editor-toolbar glass">
                <div className="toolbar-buttons">
                    {toolbarButtons.map((button, index) => {
                        if (button.type === 'separator') {
                            return <div key={index} className="toolbar-separator" />;
                        }

                        return (
                            <button
                                key={index}
                                className="toolbar-btn"
                                onClick={() => {
                                    if (button.command === 'createLink') {
                                        const url = prompt('Enter URL:');
                                        if (url) execCommand(button.command, url);
                                    } else {
                                        execCommand(button.command, button.value);
                                    }
                                }}
                                title={button.label}
                            >
                                {button.icon}
                            </button>
                        );
                    })}
                </div>
                {getSaveStatus()}
            </div>

            {/* Title */}
            <input
                type="text"
                className="editor-title"
                placeholder="Untitled"
                value={title}
                onChange={handleTitleChange}
            />

            {/* Content */}
            <textarea
                ref={contentRef}
                className="editor-content"
                placeholder="Start writing your thoughts..."
                value={content}
                onChange={handleContentChange}
            />

            {/* Stats */}
            <div className="editor-stats">
                <span className="stat-item">
                    <strong>{content.split(/\s+/).filter(Boolean).length}</strong> words
                </span>
                <span className="stat-item">
                    <strong>{content.length}</strong> characters
                </span>
                <span className="stat-item">
                    Created: {new Date(currentNote.createdAt).toLocaleDateString()}
                </span>
                <span className="stat-item">
                    Modified: {new Date(currentNote.updatedAt).toLocaleString()}
                </span>
            </div>
        </motion.div>
    );
};
