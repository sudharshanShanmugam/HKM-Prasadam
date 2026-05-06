'use client';
import React, { useState } from 'react';
import { useGetMealMenuByDateQuery, useSaveMealMenuMutation } from '@/services/mealMenusApi';
import type { MealMenuMap } from '@/types';

// MUI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

// MUI Icons
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';

const S  = '#E8621A';
const SD = '#C44D0D';
const SP = '#FEF0E6';
const GOLD      = '#C9920A';
const GOLD_PALE = '#FFF9E6';

const MEALS: Array<{ key: keyof MealMenuMap; label: string; icon: React.ReactNode; bg: string; color: string }> = [
  { key: 'Breakfast', label: 'Breakfast', icon: <FreeBreakfastIcon sx={{ fontSize: 18, color: SD }} />, bg: SP,        color: SD },
  { key: 'Lunch',     label: 'Lunch',     icon: <WbSunnyIcon       sx={{ fontSize: 18, color: GOLD }} />, bg: GOLD_PALE, color: GOLD },
  { key: 'Dinner',    label: 'Dinner',    icon: <NightlightIcon    sx={{ fontSize: 18, color: '#7C3AED' }} />, bg: '#F5F0FF', color: '#7C3AED' },
];

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px', fontSize: '0.83rem', bgcolor: '#fff',
    '& fieldset': { borderColor: '#E8D8C0' },
    '&:hover fieldset': { borderColor: S },
    '&.Mui-focused fieldset': { borderColor: S },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: SD },
};

function MenuEditor() {
  const [date, setDate]           = useState('');
  const [fetchDate, setFetchDate] = useState('');
  const [saved, setSaved]         = useState(false);
  const [menuText, setMenuText]   = useState<MealMenuMap>({ Breakfast: '', Lunch: '', Dinner: '' });

  const { data: existingMenu } = useGetMealMenuByDateQuery(fetchDate, { skip: !fetchDate });
  const [saveMenu, { isLoading: saving }] = useSaveMealMenuMutation();

  const handleLoad = () => {
    if (!date) return;
    setFetchDate(date);
    if (existingMenu) setMenuText(existingMenu.meals);
  };

  const handleSave = async () => {
    if (!date) return;
    await saveMenu({ date, meals: menuText });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Date picker row */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <TextField
          type="date" size="small" label="Select Date" value={date}
          onChange={e => setDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: 1, ...FIELD_SX }}
        />
        <Button
          variant="outlined" size="medium"
          startIcon={<DownloadIcon sx={{ fontSize: '16px !important' }} />}
          disabled={!date}
          onClick={handleLoad}
          sx={{
            borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.83rem',
            borderColor: '#E8D8C0', color: '#5A3A1A', whiteSpace: 'nowrap',
            '&:hover': { bgcolor: SP, borderColor: S },
            '&.Mui-disabled': { opacity: 0.45 },
          }}
        >
          Load
        </Button>
      </Box>

      <Divider sx={{ borderColor: '#F2E8D8' }} />

      {/* Meal textareas */}
      {MEALS.map(m => (
        <Box key={m.key}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {m.icon}
            </Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: m.color }}>
              {m.label}
            </Typography>
          </Box>
          <TextField
            multiline minRows={2} fullWidth size="small"
            placeholder={`${m.label} menu description…`}
            value={menuText[m.key]}
            onChange={e => setMenuText(p => ({ ...p, [m.key]: e.target.value }))}
            sx={{
              ...FIELD_SX,
              '& .MuiOutlinedInput-root': {
                ...FIELD_SX['& .MuiOutlinedInput-root'],
                borderRadius: '10px',
              },
            }}
          />
        </Box>
      ))}

      <Button
        variant="contained" size="medium"
        startIcon={
          saving ? <CircularProgress size={16} color="inherit" /> :
          saved   ? <CheckIcon sx={{ fontSize: '16px !important' }} /> :
                    <SaveIcon  sx={{ fontSize: '16px !important' }} />
        }
        disabled={saving || !date}
        onClick={handleSave}
        sx={{
          borderRadius: '50px', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
          bgcolor: saved ? '#1B7A4A' : S, alignSelf: 'flex-start', px: 3,
          boxShadow: '0 3px 12px rgba(232,98,26,0.3)',
          '&:hover': { bgcolor: saved ? '#155A38' : SD },
          '&.Mui-disabled': { opacity: 0.45 },
          transition: 'background-color 0.3s',
        }}
      >
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Menus'}
      </Button>
    </Box>
  );
}

export default function MenusPage() {
  return (
    <Box sx={{ maxWidth: 580 }}>
      {/* PAGE HEADER */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <MenuBookIcon sx={{ color: SD, fontSize: 28 }} />
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color: SD }}>
            Meal Menu Editor
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.85rem', color: '#9A7A5A' }}>
          Set or update the menu description for each meal by date.
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>
        {/* Card header */}
        <Box sx={{
          px: 3, py: 2,
          background: 'linear-gradient(135deg, #FEF0E6 0%, #FFF9E6 100%)',
          borderBottom: '1.5px solid #F2E8D8',
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <MenuBookIcon sx={{ fontSize: 18, color: SD }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: SD }}>
            Edit Menus by Date
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <MenuEditor />
        </Box>
      </Card>
    </Box>
  );
}
