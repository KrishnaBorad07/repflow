import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-accent text-accent-ink font-semibold hover:brightness-110',
  secondary: 'bg-transparent text-text border border-hairline hover:bg-elevated',
  ghost: 'bg-transparent text-muted hover:text-text',
  danger: 'bg-bad text-white font-semibold hover:brightness-110',
};

const sizes = {
  sm: 'h-9 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-11 px-[18px] text-sm rounded-btn gap-2',
  lg: 'h-[52px] px-[22px] text-[15px] rounded-xl gap-2',
  xl: 'h-14 px-7 text-base rounded-xl gap-2.5',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', fullWidth = false, disabled = false, onClick, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center font-medium transition-colors select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}
