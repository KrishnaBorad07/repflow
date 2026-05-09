import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import useMediaQuery from '../../hooks/useMediaQuery';

export default function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="min-h-screen bg-background text-text flex">
      {isDesktop && <Sidebar />}

      <main className={`flex-1 ${isDesktop ? 'overflow-y-auto' : 'pb-[84px]'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!isDesktop && <BottomNav />}
    </div>
  );
}
