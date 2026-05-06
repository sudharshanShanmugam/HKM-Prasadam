'use client';
import React, { createContext, useCallback, useContext, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const CONFIG: Record<ToastType, { bg: string; border: string; color: string; icon: React.ReactNode }> = {
  success: {
    bg: '#F0FDF4', border: '#86EFAC', color: '#15803D',
    icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#15803D' }} />,
  },
  error: {
    bg: '#FEF2F2', border: '#FCA5A5', color: '#B91C1C',
    icon: <ErrorIcon sx={{ fontSize: 20, color: '#B91C1C' }} />,
  },
  warning: {
    bg: '#FFFBEB', border: '#FCD34D', color: '#B45309',
    icon: <WarningAmberIcon sx={{ fontSize: 20, color: '#B45309' }} />,
  },
  info: {
    bg: '#FEF0E6', border: '#F4A06A', color: '#C44D0D',
    icon: <InfoIcon sx={{ fontSize: 20, color: '#C44D0D' }} />,
  },
};

let _id = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++_id;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: number) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — bottom-right */}
      <Box sx={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '10px',
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => {
          const cfg = CONFIG[toast.type];
          return (
            <Box
              key={toast.id}
              sx={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                bgcolor: cfg.bg,
                border: `1.5px solid ${cfg.border}`,
                borderRadius: '12px',
                px: '14px', py: '12px',
                minWidth: 280, maxWidth: 360,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                pointerEvents: 'all',
                animation: 'toastSlideIn 0.25s ease-out',
                '@keyframes toastSlideIn': {
                  from: { opacity: 0, transform: 'translateX(40px)' },
                  to:   { opacity: 1, transform: 'translateX(0)' },
                },
              }}
            >
              <Box sx={{ flexShrink: 0, mt: 0.1 }}>{cfg.icon}</Box>
              <Typography sx={{
                flex: 1, fontSize: '0.85rem', fontWeight: 500,
                color: cfg.color, fontFamily: 'Inter, sans-serif',
                lineHeight: 1.45,
              }}>
                {toast.message}
              </Typography>
              <IconButton
                size="small"
                onClick={() => dismiss(toast.id)}
                sx={{ color: cfg.color, opacity: 0.5, p: 0.25, mt: '-2px', flexShrink: 0, '&:hover': { opacity: 1 } }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </ToastContext.Provider>
  );
}
