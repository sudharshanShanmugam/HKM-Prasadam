'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { S, SD, SP, GOLD, CREAM, BROWN, TXT_MID, TXT_LIGHT, BORDER, HEADER_H } from './constants';
import type { View } from './constants';

interface PartySuccessViewProps {
  ptySuccessId: string;
  ptyMobile: string;
  setBkMobile: (v: string | null) => void;
  setBkInput: (v: string) => void;
  onGoTo: (v: View) => void;
}

export default function PartySuccessView({
  ptySuccessId,
  ptyMobile,
  setBkMobile,
  setBkInput,
  onGoTo,
}: PartySuccessViewProps) {
  return (
    <Box sx={{ minHeight: '100vh', pt: `${HEADER_H}px`, background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <Box sx={{ maxWidth: 500, width: '100%', px: 2.5, py: 6, textAlign: 'center' }}>
        <Box sx={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ebf7ed, #d4edda)',
          border: '3px solid #b2dfbc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', mx: 'auto', mb: 3.5,
        }}>
        </Box>
        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: BROWN, mb: 1.5 }}>
          Enquiry Submitted!
        </Typography>
        <Box sx={{ display: 'inline-block', bgcolor: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: '12px', px: 3.5, py: 1.75, mb: 3 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TXT_LIGHT, mb: 0.625 }}>Enquiry ID</Typography>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: S, letterSpacing: '0.06em' }}>{ptySuccessId}</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.88rem', color: TXT_MID, lineHeight: 1.75, mb: 3.5 }}>
          Your party prasadam enquiry has been received.<br />
          Our admin team will <strong>contact you within 24–48 hours</strong> to confirm details.
        </Typography>
        <Box sx={{ bgcolor: SP, borderRadius: '10px', p: '14px 16px', fontSize: '0.78rem', color: SD, textAlign: 'left', mb: 2.5 }}>
          <Typography sx={{ fontSize: '0.78rem', color: SD, fontWeight: 700, mb: 1 }}>What happens next?</Typography>
          {['Admin reviews your enquiry', 'You receive a confirmation call / message', 'Payment details shared upon acceptance', 'Prasadam delivered on your event date 🎂'].map((s, i) => (
            <Typography key={i} sx={{ fontSize: '0.78rem', color: SD, mb: 0.5 }}>{i + 1}. {s}</Typography>
          ))}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button onClick={() => { setBkMobile(ptyMobile); setBkInput(ptyMobile); onGoTo('bookings'); }} sx={{
            width: '100%', py: 1.75, borderRadius: '10px',
            background: `linear-gradient(135deg, ${S}, ${GOLD})`,
            color: '#fff', fontSize: '0.95rem', fontWeight: 700,
            boxShadow: '0 4px 16px rgba(232,98,26,0.3)', textTransform: 'none',
            '&:hover': { opacity: 0.92 },
          }}>
            📋 View My Enquiries
          </Button>
          <Button onClick={() => onGoTo('landing')} sx={{
            width: '100%', py: 1.25, borderRadius: '10px', border: `1.5px solid ${BORDER}`,
            bgcolor: 'transparent', color: TXT_MID, fontSize: '0.84rem', fontWeight: 500,
            textTransform: 'none', '&:hover': { bgcolor: CREAM },
          }}>
            ← Back to Home
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
