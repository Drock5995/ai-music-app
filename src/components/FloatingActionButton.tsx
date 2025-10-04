import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showLabel?: boolean;
  disabled?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label = 'Add',
  variant = 'primary',
  size = 'medium',
  position = 'bottom-right',
  showLabel = false,
  disabled = false,
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16',
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const variantClasses = {
    primary: 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30',
    secondary: 'bg-gray-700 hover:bg-gray-800 text-white shadow-lg shadow-gray-700/30',
  };

  return (
    <motion.button
      className={`
        fixed ${positionClasses[position]} ${sizeClasses[size]} ${variantClasses[variant]}
        rounded-full flex items-center justify-center
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-green-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        z-50
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      aria-label={label}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={icon ? 'icon' : 'plus'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {icon || (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Label tooltip */}
      <AnimatePresence>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: position.includes('right') ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: position.includes('right') ? -10 : 10 }}
            className={`
              absolute ${position.includes('right') ? 'right-full mr-3' : 'left-full ml-3'}
              top-1/2 transform -translate-y-1/2
              bg-gray-900 text-white px-3 py-1 rounded-lg text-sm
              whitespace-nowrap shadow-lg
              pointer-events-none
            `}
          >
            {label}
            {/* Arrow */}
            <div
              className={`
                absolute top-1/2 transform -translate-y-1/2 w-0 h-0
                ${position.includes('right')
                  ? 'right-0 translate-x-1 border-l-4 border-l-gray-900 border-y-4 border-y-transparent'
                  : 'left-0 -translate-x-1 border-r-4 border-r-gray-900 border-y-4 border-y-transparent'
                }
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default FloatingActionButton;
