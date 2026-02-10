import { create } from 'zustand';

export const useUIStore = create((set) => ({
    theme: typeof window !== 'undefined' ? (localStorage.getItem('theme') || 'dark') : 'dark',
    sidebarOpen: true,
    activeModal: null,
    toasts: [],

    // Theme
    toggleTheme: () => {
        set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            }
            return { theme: newTheme };
        });
    },

    setTheme: (theme) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
        }
        set({ theme });
    },

    // Sidebar
    toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    },

    setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
    },

    // Modal
    openModal: (modalName) => {
        set({ activeModal: modalName });
    },

    closeModal: () => {
        set({ activeModal: null });
    },

    // Toast notifications
    addToast: (toast) => {
        const id = Date.now();
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }));

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, 3000);
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));
