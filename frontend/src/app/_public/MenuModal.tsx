'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import type { MealType } from '@/types';
import { BROWN, TXT_MID, TXT_LIGHT, BORDER, mealIcon } from './constants';

interface MenuModalProps {
  menuModal: { meal: MealType; text: string };
  onClose: () => void;
}

export default function MenuModal({ menuModal, onClose }: MenuModalProps) {
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px', border: `1.5px solid ${BORDER}` } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, pt: 2.5, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {mealIcon(menuModal.meal)}
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: BROWN }}>
            {menuModal.meal} Menu
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: TXT_LIGHT }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ borderColor: BORDER }} />
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {menuModal.text
          ? menuModal.text.split('\n').filter(Boolean).map((line, i) => (
              <Typography key={i} sx={{ fontSize: '0.88rem', color: TXT_MID, py: 0.375 }}>• {line}</Typography>
            ))
          : <Typography sx={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', py: 1.25 }}>No menu added for this meal yet.</Typography>
        }
      </DialogContent>
    </Dialog>
  );
}
