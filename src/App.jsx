import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function App() {
    const [theme, setTheme] = useState('dark');
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('editor'); // editor or canvas

    // Canvas state
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawColor, setDrawColor] = useState('#6366f1');
    const [lineWidth, setLineWidth] = useState(2);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        if (activeTab === 'canvas' && canvasRef.current && currentNote) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            // Load saved canvas data
            if (currentNote.canvasData) {
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.src = currentNote.canvasData;
            } else {
                ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [activeTab, currentNote, theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const createNote = () => {
        const newNote = {
            id: Date.now(),
            title: 'Untitled Note',
            content: '',
            canvasData: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setNotes([newNote, ...notes]);
        setCurrentNote(newNote);
    };

    const updateNote = (id, updates) => {
        setNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
        if (currentNote?.id === id) {
            setCurrentNote({ ...currentNote, ...updates, updatedAt: Date.now() });
        }
    };

    const deleteNote = (id) => {
        if (window.confirm('Delete this note?')) {
            setNotes(notes.filter(n => n.id !== id));
            if (currentNote?.id === id) {
                setCurrentNote(null);
            }
        }
    };

    // Canvas functions
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing && currentNote) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            const canvasData = canvas.toDataURL();
            updateNote(currentNote.id, { canvasData });
        }
    };

    const clearCanvas = () => {
        if (!window.confirm('Clear the entire canvas?')) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (currentNote) {
            updateNote(currentNote.id, { canvasData: null });
        }
    };

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#000000', '#ffffff'];

    return (
        <div className="app">
            <header className="app-header glass">
                <div className="header-left">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-btn">
                        ☰
                    </button>
                    <h1 className="app-logo gradient-text">NoteFlow</h1>
                </div>

                <div className="header-center">
                    {currentNote && (
                        <div className="tab-switcher">
                            <button
                                className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
                                onClick={() => setActiveTab('editor')}
                            >
                                📝 Editor
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'canvas' ? 'active' : ''}`}
                                onClick={() => setActiveTab('canvas')}
                            >
                                🎨 Canvas
                            </button>
                        </div>
                    )}
                </div>

                <div className="header-right">
                    <button onClick={toggleTheme} className="theme-btn">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            <div className="app-content">
                {sidebarOpen && (
                    <aside className="sidebar">
                        <div className="sidebar-header">
                            <h2 className="sidebar-title gradient-text">Notes</h2>
                            <button className="btn-primary" onClick={createNote}>+ New</button>
                        </div>

                        <div className="sidebar-section flex-1">
                            <div className="section-title">All Notes ({notes.length})</div>
                            <div className="notes-list">
                                {notes.map(note => (
                                    <div
                                        key={note.id}
                                        className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
                                        onClick={() => setCurrentNote(note)}
                                    >
                                        <div className="note-item-header">
                                            <h4 className="note-item-title">{note.title}</h4>
                                            <button
                                                className="note-item-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNote(note.id);
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <p className="note-item-preview">
                                            {note.content.substring(0, 80) || (note.canvasData ? '🎨 Drawing' : 'No content')}
                                        </p>
                                        <div className="note-item-meta">
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}

                                {notes.length === 0 && (
                                    <div className="empty-state">
                                        <p>📝</p>
                                        <p>No notes yet</p>
                                        <button className="btn-primary" onClick={createNote}>
                                            Create your first note
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                )}

                <main className="main-content">
                    {currentNote ? (
                        activeTab === 'editor' ? (
                            <div className="editor">
                                <input
                                    type="text"
                                    className="editor-title"
                                    placeholder="Untitled"
                                    value={currentNote.title}
                                    onChange={(e) => updateNote(currentNote.id, { title: e.target.value })}
                                />
                                <textarea
                                    className="editor-content"
                                    placeholder="Start writing your thoughts..."
                                    value={currentNote.content}
                                    onChange={(e) => updateNote(currentNote.id, { content: e.target.value })}
                                />
                                <div className="editor-stats">
                                    <span><strong>{currentNote.content.split(/\s+/).filter(Boolean).length}</strong> words</span>
                                    <span><strong>{currentNote.content.length}</strong> characters</span>
                                    <span>Modified: {new Date(currentNote.updatedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="canvas-container">
                                <div className="canvas-toolbar glass">
                                    <div className="toolbar-group">
                                        <span className="toolbar-label">🎨 Color:</span>
                                        <div className="color-picker">
                                            {colors.map(color => (
                                                <button
                                                    key={color}
                                                    className={`color-swatch ${drawColor === color ? 'active' : ''}`}
                                                    style={{ background: color }}
                                                    onClick={() => setDrawColor(color)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="toolbar-group">
                                        <span className="toolbar-label">✏️ Size:</span>
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            value={lineWidth}
                                            onChange={(e) => setLineWidth(Number(e.target.value))}
                                            className="line-width-slider"
                                        />
                                        <span className="line-width-value">{lineWidth}px</span>
                                    </div>

                                    <button className="btn-danger" onClick={clearCanvas}>
                                        🗑️ Clear
                                    </button>
                                </div>

                                <canvas
                                    ref={canvasRef}
                                    className="drawing-canvas"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                />
                            </div>
                        )
                    ) : (
                        <div className="editor-empty-state">
                            <div className="empty-state-content">
                                <div className="empty-icon">📄</div>
                                <h2>Welcome to NoteFlow</h2>
                                <p>Select a note to start editing or create a new one</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
