import { motion } from 'framer-motion';

export default function Loader({ size = 40, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="border-2 border-hairline border-t-accent rounded-full"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
