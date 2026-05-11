'use client';
import React, { useState } from 'react';
import {
  useGetAdminUsersQuery, useCreateAdminUserMutation,
  useUpdateAdminUserMutation, useDeleteAdminUserMutation,
} from '@/services/adminUsersApi';
import type { AdminUser, CreateAdminUserDto, UpdateAdminUserDto } from '@/services/adminUsersApi';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const S          = '#E8621A';
const SD         = '#C44D0D';
const SP         = '#FEF0E6';
const GOLD       = '#C9920A';
const GOLD_PALE  = '#FFF9E6';
const GREEN      = '#1B7A4A';
const GREEN_PALE = '#E6F5EC';
const RED        = '#B91C1C';
const RED_PALE   = '#FEE2E2';
const BROWN      = '#3B1F0A';
const TXT_LIGHT  = '#9A7A5A';
const BORDER     = '#F2E8D8';

const TH_SX = {
  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase' as const, color: SD,
  bgcolor: SP, py: 1.5, px: 2,
  borderBottom: '1.5px solid rgba(232,98,26,0.15)',
  whiteSpace: 'nowrap' as const,
};

const TD_SX = {
  fontSize: '0.83rem', color: BROWN,
  py: 1.5, px: 2,
  borderBottom: `1px solid ${BORDER}`,
  verticalAlign: 'middle' as const,
};

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', bgcolor: '#fff', fontSize: '0.82rem',
    '& fieldset': { borderColor: '#E8D8C0' },
    '&:hover fieldset': { borderColor: S },
    '&.Mui-focused fieldset': { borderColor: S, borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.78rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: SD },
};

const BLUE      = '#1565C0';
const BLUE_PALE = '#E3F0FF';
const PURPLE    = '#6B21A8';
const PURP_PALE = '#F3E8FF';
const TEAL      = '#0F766E';
const TEAL_PALE = '#CCFBF1';

const ROLE_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  superadmin:       { label: 'Super Admin',      color: GOLD,   bg: GOLD_PALE,  border: '#F5D78E' },
  admin:            { label: 'Admin',            color: SD,     bg: SP,         border: 'rgba(232,98,26,0.3)' },
  kitchen_manager:  { label: 'Kitchen Manager',  color: RED,    bg: RED_PALE,   border: '#FCA5A5' },
  accounts_manager: { label: 'Accounts Manager', color: BLUE,   bg: BLUE_PALE,  border: '#90CAF9' },
  gita_counter:     { label: 'Gita Counter',     color: PURPLE, bg: PURP_PALE,  border: '#D8B4FE' },
  prasadam_hall:    { label: 'Prasadam Hall',    color: TEAL,   bg: TEAL_PALE,  border: '#5EEAD4' },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CFG[role] ?? ROLE_CFG.admin;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: cfg.bg, color: cfg.color,
        fontWeight: 700, fontSize: '0.67rem', borderRadius: '50px',
        border: `1px solid ${cfg.border}`, height: 22,
      }}
    />
  );
}

function StatCard({ icon, label, value, color, iconBg }: {
  icon: React.ReactNode; label: string; value: number;
  color: string; iconBg: string;
}) {
  return (
    <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', boxShadow: '0 2px 10px rgba(232,98,26,0.07)' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '18px 20px !important' }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT_LIGHT }}>
            {label}
          </Typography>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color, lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

const ROLE_LIST: { value: AdminUser['role']; label: string; desc: string }[] = [
  { value: 'superadmin',       label: 'Super Admin',      desc: 'Full access to everything' },
  { value: 'admin',            label: 'Admin',            desc: 'All pages except user management' },
  { value: 'accounts_manager', label: 'Accounts Manager', desc: 'Payments tab only' },
  { value: 'kitchen_manager',  label: 'Kitchen Manager',  desc: 'Internal orders only' },
  { value: 'gita_counter',     label: 'Gita Counter',     desc: 'Registrations only' },
  { value: 'prasadam_hall',    label: 'Prasadam Hall',    desc: 'Registrations & internal orders' },
];

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
function UserModal({ editing, onClose }: { editing: AdminUser | null; onClose: () => void }) {
  const [createUser, { isLoading: creating }] = useCreateAdminUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateAdminUserMutation();

  const [name,     setName]     = useState(editing?.name  ?? '');
  const [email,    setEmail]    = useState(editing?.email ?? '');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState<AdminUser['role']>(editing?.role ?? 'admin');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');

  const isEdit = !!editing;
  const isBusy = creating || updating;
  const cfg    = ROLE_CFG[role] ?? ROLE_CFG.admin;

  // Avatar initials from name
  const initials = name.trim()
    ? name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '';

  async function handleSave() {
    setError('');
    if (!name.trim())             { setError('Full name is required'); return; }
    if (!isEdit && !email.trim()) { setError('Email address is required'); return; }
    if (!isEdit && !password)     { setError('Password is required'); return; }
    if (password && password.length < 6) { setError('Password must be at least 6 characters'); return; }

    if (isEdit) {
      const data: UpdateAdminUserDto = { name, role };
      if (password) data.password = password;
      const res = await updateUser({ id: editing!._id, data });
      if ('error' in res) { setError('Failed to update user'); return; }
    } else {
      const dto: CreateAdminUserDto = { name, email, password, role };
      const res = await createUser(dto);
      if ('error' in res) {
        const err = res.error as { data?: { message?: string } };
        setError(err.data?.message ?? 'Failed to create user');
        return;
      }
    }
    onClose();
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '22px', overflow: 'hidden', m: { xs: 1.5, sm: 2 } } } }}>

      {/* ── Gradient header ── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${SD} 0%, ${S} 100%)`,
        px: 3, pt: 2.5, pb: 3, position: 'relative',
      }}>
        <IconButton size="small" onClick={onClose} sx={{
          position: 'absolute', top: 12, right: 12,
          bgcolor: 'rgba(255,255,255,0.15)', color: '#fff',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
        }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>

        {/* Avatar + title row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '14px', flexShrink: 0,
            bgcolor: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {initials
              ? <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{initials}</Typography>
              : <PersonAddIcon sx={{ fontSize: 26, color: 'rgba(255,255,255,0.85)' }} />
            }
          </Box>
          <Box>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {isEdit ? `Edit ${editing!.name.split(' ')[0]}` : 'Add Admin User'}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', mt: 0.25 }}>
              {isEdit ? editing!.email : 'Create a new admin account'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5, bgcolor: '#FBF6EE' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Name + Email row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr' : '1fr 1fr', gap: 1.5 }}>
            <TextField fullWidth size="small" label="Full Name *"
              value={name} onChange={e => setName(e.target.value)}
              sx={{ ...FIELD_SX, '& .MuiOutlinedInput-root': { ...FIELD_SX['& .MuiOutlinedInput-root'], bgcolor: '#fff' } }}
            />
            {!isEdit && (
              <TextField fullWidth size="small" label="Email Address *" type="email"
                value={email} onChange={e => setEmail(e.target.value)}
                sx={{ ...FIELD_SX, '& .MuiOutlinedInput-root': { ...FIELD_SX['& .MuiOutlinedInput-root'], bgcolor: '#fff' } }}
              />
            )}
          </Box>

          {/* Password */}
          <TextField
            fullWidth size="small"
            label={isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton size="small" onClick={() => setShowPass(v => !v)} sx={{ color: TXT_LIGHT }}>
                    {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                ),
              },
            }}
            sx={{ ...FIELD_SX, '& .MuiOutlinedInput-root': { ...FIELD_SX['& .MuiOutlinedInput-root'], bgcolor: '#fff' } }}
          />

          {/* Role dropdown */}
          <FormControl fullWidth size="small" sx={FIELD_SX}>
            <InputLabel>Role &amp; Permissions</InputLabel>
            <Select
              label="Role & Permissions"
              value={role}
              onChange={e => setRole(e.target.value as AdminUser['role'])}
              renderValue={v => {
                const r = ROLE_LIST.find(r => r.value === v);
                const c = ROLE_CFG[v as string] ?? ROLE_CFG.admin;
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: BROWN }}>{r?.label}</Typography>
                  </Box>
                );
              }}
            >
              {ROLE_LIST.map(r => {
                const c = ROLE_CFG[r.value] ?? ROLE_CFG.admin;
                return (
                  <MenuItem key={r.value} value={r.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.25 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: BROWN, lineHeight: 1.2 }}>{r.label}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: TXT_LIGHT }}>{r.desc}</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {error && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: RED_PALE, border: `1.5px solid #FCA5A5`, borderRadius: '10px', px: 1.5, py: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', color: RED }}>⚠️ {error}</Typography>
            </Box>
          )}

          <Button
            fullWidth variant="contained"
            startIcon={isBusy ? <CircularProgress size={15} color="inherit" /> : undefined}
            disabled={isBusy}
            onClick={handleSave}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: '0.95rem',
              bgcolor: S, '&:hover': { bgcolor: SD }, py: 1.25,
              boxShadow: '0 4px 14px rgba(232,98,26,0.35)',
            }}
          >
            {isBusy ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useGetAdminUsersQuery();
  const [deleteUser, { isLoading: deleting }] = useDeleteAdminUserMutation();
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<AdminUser | null>(null);
  const [confirmDel, setConfirmDel] = useState<AdminUser | null>(null);

  const total      = users.length;
  const superAdmins = users.filter(u => u.role === 'superadmin').length;
  const admins      = users.filter(u => u.role === 'admin').length;

  function openAdd()             { setEditing(null); setModalOpen(true); }
  function openEdit(u: AdminUser){ setEditing(u);    setModalOpen(true); }

  async function handleDelete() {
    if (!confirmDel) return;
    await deleteUser(confirmDel._id);
    setConfirmDel(null);
  }

  return (
    <Box>
      {/* PAGE HEADER */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25 }}>
            <PeopleIcon sx={{ color: SD, fontSize: 26 }} />
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color: SD }}>
              Admin Users
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.82rem', color: TXT_LIGHT }}>
            {total} user{total !== 1 ? 's' : ''} · {superAdmins} super admin{superAdmins !== 1 ? 's' : ''} · {admins} admin{admins !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={openAdd}
          sx={{
            borderRadius: '10px', textTransform: 'none', fontWeight: 700,
            bgcolor: S, '&:hover': { bgcolor: SD }, px: 2.5, py: 1,
          }}
        >
          Add Admin
        </Button>
      </Box>

      {/* STAT CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={4}>
          <StatCard icon={<PeopleIcon />}             label="Total Users"  value={total}       color={SD}   iconBg={SP}         />
        </Grid>
        <Grid size={4}>
          <StatCard icon={<AdminPanelSettingsIcon />} label="Super Admins" value={superAdmins} color={GOLD} iconBg={GOLD_PALE}  />
        </Grid>
        <Grid size={4}>
          <StatCard icon={<PersonAddIcon />}          label="Admins"       value={admins}      color={GREEN} iconBg={GREEN_PALE} />
        </Grid>
      </Grid>

      {/* TABLE */}
      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...TH_SX, minWidth: 160 }}>Name</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 200 }}>Email</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 120 }}>Role</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 130 }}>Created</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 80  }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={24} sx={{ color: S }} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: TXT_LIGHT, fontSize: '0.85rem' }}>
                    No admin users found.
                  </TableCell>
                </TableRow>
              ) : users.map(u => (
                <TableRow key={u._id} sx={{ '&:hover td': { bgcolor: '#FDFAF4' }, '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ ...TD_SX, fontWeight: 600 }}>{u.name}</TableCell>
                  <TableCell sx={{ ...TD_SX, color: TXT_LIGHT }}>{u.email}</TableCell>
                  <TableCell sx={TD_SX}><RoleBadge role={u.role} /></TableCell>
                  <TableCell sx={{ ...TD_SX, color: TXT_LIGHT, fontSize: '0.78rem' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, pr: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => openEdit(u)}
                        sx={{ color: SD, bgcolor: SP, borderRadius: '8px', p: 0.7, border: '1.5px solid rgba(232,98,26,0.2)', '&:hover': { bgcolor: '#FEE0CC' } }}>
                        <EditIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setConfirmDel(u)}
                        sx={{ color: RED, bgcolor: RED_PALE, borderRadius: '8px', p: 0.7, border: `1.5px solid ${RED}33`, '&:hover': { bgcolor: '#FECACA' } }}>
                        <DeleteIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ px: 3, py: 1.25, borderTop: `1px solid ${BORDER}`, bgcolor: '#FDFAF6' }}>
          <Typography sx={{ fontSize: '0.75rem', color: TXT_LIGHT }}>
            {total} admin user{total !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Card>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <UserModal editing={editing} onClose={() => setModalOpen(false)} />
      )}

      {/* Delete Confirm Dialog */}
      {confirmDel && (
        <Dialog open onClose={() => setConfirmDel(null)} maxWidth="xs" fullWidth
          slotProps={{ paper: { sx: { borderRadius: '18px' } } }}>
          <Box sx={{ px: 3, pt: 3, pb: 2.5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>⚠️</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: BROWN, mb: 0.75 }}>
              Delete Admin User?
            </Typography>
            <Typography sx={{ fontSize: '0.83rem', color: TXT_LIGHT, mb: 2.5 }}>
              Remove <strong>{confirmDel.name}</strong> ({confirmDel.email})? This cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.25 }}>
              <Button fullWidth onClick={() => setConfirmDel(null)}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, border: `1.5px solid ${BORDER}`, color: TXT_LIGHT, '&:hover': { bgcolor: SP } }}>
                Cancel
              </Button>
              <Button fullWidth variant="contained" onClick={handleDelete}
                disabled={deleting}
                startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon />}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, bgcolor: RED, '&:hover': { bgcolor: '#991B1B' } }}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}
    </Box>
  );
}
