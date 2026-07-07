import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const [sidebarHidden, setSidebarHidden] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar hidden={sidebarHidden} onHide={() => setSidebarHidden(true)} />

      {/* Botón flotante para volver a mostrar el sidebar */}
      {sidebarHidden && (
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.12, delay: 0.05 }}
          onClick={() => setSidebarHidden(false)}
          className="fixed top-4 left-4 z-50 w-9 h-9 rounded-lg bg-sidebar text-white/90 hover:text-white hover:bg-sidebar-hover shadow-card flex items-center justify-center transition-colors duration-75"
          title="Mostrar menú"
        >
          <FontAwesomeIcon icon={faBars} className="w-4 h-4" />
        </motion.button>
      )}

      <main
        className={`min-h-screen transition-[margin-left] duration-150 ease-out ${
          sidebarHidden ? 'ml-0' : 'ml-56'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
