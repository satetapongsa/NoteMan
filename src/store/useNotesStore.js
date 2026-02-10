import { create } from 'zustand';
import { openDB } from 'idb';

// Initialize IndexedDB
const DB_NAME = 'NoteFlowDB';
const DB_VERSION = 1;

const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('notes')) {
                const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
                notesStore.createIndex('folderId', 'folderId');
                notesStore.createIndex('createdAt', 'createdAt');
                notesStore.createIndex('updatedAt', 'updatedAt');
            }
            if (!db.objectStoreNames.contains('folders')) {
                db.createObjectStore('folders', { keyPath: 'id' });
            }
        },
    });
};

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Auto-save debounce helper
let autoSaveTimeout = null;
const AUTO_SAVE_DELAY = 1000; // 1 second

export const useNotesStore = create((set, get) => ({
    notes: [],
    folders: [],
    tags: new Set(),
    currentNote: null,
    searchQuery: '',
    viewMode: 'document', // document, canvas, table, kanban
    isLoading: true,
    isSaving: false,
    lastSaved: null,

    // Initialize store and load data from IndexedDB
    initialize: async () => {
        try {
            const db = await initDB();
            const notes = await db.getAll('notes');
            const folders = await db.getAll('folders');

            // Extract unique tags
            const allTags = new Set();
            notes.forEach(note => {
                note.tags?.forEach(tag => allTags.add(tag));
            });

            set({
                notes: notes.sort((a, b) => b.updatedAt - a.updatedAt),
                folders,
                tags: allTags,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to initialize store:', error);
            set({ isLoading: false });
        }
    },

    // Auto-save functionality
    autoSave: async (id, updates) => {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        set({ isSaving: true });

        autoSaveTimeout = setTimeout(async () => {
            await get().updateNote(id, updates, true);
            set({ isSaving: false, lastSaved: Date.now() });
        }, AUTO_SAVE_DELAY);
    },

    // Create new note
    createNote: async (noteData) => {
        const newNote = {
            id: generateId(),
            title: noteData.title || 'Untitled',
            content: noteData.content || '',
            canvasData: noteData.canvasData || null,
            folderId: noteData.folderId || null,
            tags: noteData.tags || [],
            color: noteData.color || null,
            favorite: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        try {
            const db = await initDB();
            await db.add('notes', newNote);

            set(state => ({
                notes: [newNote, ...state.notes],
                currentNote: newNote,
                tags: new Set([...state.tags, ...newNote.tags]),
                lastSaved: Date.now(),
            }));

            return newNote;
        } catch (error) {
            console.error('Failed to create note:', error);
            return null;
        }
    },

    // Update note (with auto-save support)
    updateNote: async (id, updates, isAutoSave = false) => {
        const currentNotes = get().notes;
        const existingNote = currentNotes.find(n => n.id === id);

        if (!existingNote) return null;

        const updatedNote = {
            ...existingNote,
            ...updates,
            updatedAt: Date.now(),
        };

        try {
            const db = await initDB();
            await db.put('notes', updatedNote);

            set(state => ({
                notes: state.notes.map(n => n.id === id ? updatedNote : n)
                    .sort((a, b) => b.updatedAt - a.updatedAt),
                currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
                tags: new Set([...state.tags, ...(updatedNote.tags || [])]),
                lastSaved: isAutoSave ? Date.now() : state.lastSaved,
            }));

            return updatedNote;
        } catch (error) {
            console.error('Failed to update note:', error);
            return null;
        }
    },

    // Delete note
    deleteNote: async (id) => {
        try {
            const db = await initDB();
            await db.delete('notes', id);

            set(state => ({
                notes: state.notes.filter(n => n.id !== id),
                currentNote: state.currentNote?.id === id ? null : state.currentNote,
            }));

            return true;
        } catch (error) {
            console.error('Failed to delete note:', error);
            return false;
        }
    },

    // Toggle favorite
    toggleFavorite: async (id) => {
        const note = get().notes.find(n => n.id === id);
        if (note) {
            await get().updateNote(id, { favorite: !note.favorite });
        }
    },

    // Create folder
    createFolder: async (name, parentId = null) => {
        const newFolder = {
            id: generateId(),
            name,
            parentId,
            createdAt: Date.now(),
        };

        try {
            const db = await initDB();
            await db.add('folders', newFolder);

            set(state => ({
                folders: [...state.folders, newFolder],
            }));

            return newFolder;
        } catch (error) {
            console.error('Failed to create folder:', error);
            return null;
        }
    },

    // Update folder
    updateFolder: async (id, updates) => {
        const updatedFolder = {
            ...get().folders.find(f => f.id === id),
            ...updates,
        };

        try {
            const db = await initDB();
            await db.put('folders', updatedFolder);

            set(state => ({
                folders: state.folders.map(f => f.id === id ? updatedFolder : f),
            }));

            return updatedFolder;
        } catch (error) {
            console.error('Failed to update folder:', error);
            return null;
        }
    },

    // Delete folder
    deleteFolder: async (id) => {
        try {
            const db = await initDB();
            await db.delete('folders', id);

            // Move notes in this folder to root
            const notesToUpdate = get().notes.filter(n => n.folderId === id);
            for (const note of notesToUpdate) {
                await get().updateNote(note.id, { folderId: null });
            }

            set(state => ({
                folders: state.folders.filter(f => f.id !== id),
            }));

            return true;
        } catch (error) {
            console.error('Failed to delete folder:', error);
            return false;
        }
    },

    // Set current note
    setCurrentNote: (note) => {
        set({ currentNote: note });
    },

    // Search notes
    setSearchQuery: (query) => {
        set({ searchQuery: query });
    },

    getFilteredNotes: () => {
        const { notes, searchQuery } = get();
        if (!searchQuery) return notes;

        const query = searchQuery.toLowerCase();
        return notes.filter(note =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            note.tags?.some(tag => tag.toLowerCase().includes(query))
        );
    },

    // Set view mode
    setViewMode: (mode) => {
        set({ viewMode: mode });
    },

    // Get notes by folder
    getNotesByFolder: (folderId) => {
        return get().notes.filter(n => n.folderId === folderId);
    },

    // Get notes by tag
    getNotesByTag: (tag) => {
        return get().notes.filter(n => n.tags?.includes(tag));
    },

    // Get favorite notes
    getFavoriteNotes: () => {
        return get().notes.filter(n => n.favorite);
    },

    // Get recent notes
    getRecentNotes: (limit = 5) => {
        return get().notes.slice(0, limit);
    },
}));
