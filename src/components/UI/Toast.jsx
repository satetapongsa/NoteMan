import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import './Toast.css';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

export const Toast = () => {
    const { toasts, removeToast } = useUIStore();

    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const Icon = icons[toast.type] || Info;

                    return (
                        <motion.div
                            key={toast.id}
                            className={`toast toast-${toast.type}`}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Icon className="toast-icon" size={20} />
                            <div className="toast-content">
                                {toast.title && <div className="toast-title">{toast.title}</div>}
                                {toast.message && <div className="toast-message">{toast.message}</div>}
                            </div>
                            <button
                                className="toast-close"
                                onClick={() => removeToast(toast.id)}
                                aria-label="Close notification"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
