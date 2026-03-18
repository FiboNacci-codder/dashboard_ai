import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Bell } from 'lucide-react';

interface AlertData {
  id: string;
  contactId: string;
  sede: string;
}

interface AlertOverlayProps {
  alerts: AlertData[];
  onComplete: (id: string) => void;
}

export const AlertOverlay: React.FC<AlertOverlayProps> = ({ alerts, onComplete }) => {
  const [cashRegisterSound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'));

  useEffect(() => {
    if (alerts.length > 0) {
      cashRegisterSound.currentTime = 0;
      cashRegisterSound.play().catch(e => console.error("Audio play failed", e));
    }
  }, [alerts]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} onComplete={() => onComplete(alert.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const AlertItem: React.FC<{ alert: AlertData; onComplete: () => void }> = ({ alert, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate random positions for the "Check rain"
  const checks = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: 20 + Math.random() * 30,
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Check Rain */}
      {checks.map((check) => (
        <motion.div
          key={check.id}
          initial={{ y: -100, opacity: 0, rotate: 0 }}
          animate={{ 
            y: window.innerHeight + 100, 
            opacity: [0, 1, 1, 0],
            rotate: 360 
          }}
          transition={{ 
            duration: check.duration, 
            delay: check.delay,
            ease: "linear"
          }}
          style={{ 
            position: 'absolute', 
            left: `${check.left}%`,
            color: '#10b981' // emerald-500
          }}
        >
          <Check size={check.size} />
        </motion.div>
      ))}

      {/* Alert Card */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: -50 }}
        className="bg-zinc-900/90 backdrop-blur-xl border-2 border-emerald-500 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col items-center gap-4 max-w-md w-full"
      >
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
          <Bell className="text-black w-10 h-10" />
        </div>
        <div className="text-center">
          <h2 className="text-emerald-500 font-black text-2xl uppercase tracking-tighter italic mb-1">
            ¡Nuevo Registro Incorrecto!
          </h2>
          <div className="space-y-1">
            <p className="text-white text-3xl font-black tabular-nums">
              ID: {alert.contactId}
            </p>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
              Sede: {alert.sede}
            </p>
          </div>
        </div>
        <div className="mt-4 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="text-emerald-500 text-xs font-black uppercase tracking-[0.2em]">
            Procesando Alerta
          </span>
        </div>
      </motion.div>
    </div>
  );
};
