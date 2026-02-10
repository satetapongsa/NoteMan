import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    onClick,
    className = '',
    ...props
}) => {
    const buttonClass = `btn btn-${variant} btn-${size} ${className}`;

    return (
        <motion.button
            className={buttonClass}
            onClick={onClick}
            disabled={disabled || loading}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            {...props}
        >
            {loading && (
                <span className="btn-spinner"></span>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="btn-icon">{icon}</span>
            )}
            {!loading && children}
            {!loading && icon && iconPosition === 'right' && (
                <span className="btn-icon">{icon}</span>
            )}
        </motion.button>
    );
};
