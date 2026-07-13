import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faCircleUser, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import GeneralTab from './GeneralTab';
import CuentaTab from './CuentaTab';
import FacturacionTab from './FacturacionTab';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'general' | 'cuenta' | 'facturacion';

const tabs: { id: Tab; label: string; icon: typeof faUser }[] = [
  { id: 'general', label: 'General', icon: faUser },
  { id: 'cuenta', label: 'Cuenta', icon: faCircleUser },
  { id: 'facturacion', label: 'Facturación', icon: faCreditCard },
];

export default function SettingsModal({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('general');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.12 }}
            className="relative bg-white rounded-2xl shadow-modal w-full max-w-3xl h-[600px] max-h-[85vh] flex overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100 z-10"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            {/* Panel de navegación */}
            <div className="w-52 shrink-0 bg-gray-50 border-r border-gray-100 p-4">
              <h2 className="text-sm font-bold text-heading px-2 mb-4">Ajustes</h2>
              <nav className="space-y-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-75 ${
                      tab === t.id
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={t.icon} className="w-3.5 text-center" />
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              {tab === 'general' && <GeneralTab />}
              {tab === 'cuenta' && <CuentaTab onClose={onClose} />}
              {tab === 'facturacion' && <FacturacionTab />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
