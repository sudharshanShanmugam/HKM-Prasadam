'use client';
import React, { useState } from 'react';
import { useGetInternalOrdersQuery, useToggleAcceptMutation, useToggleDeliverMutation } from '@/services/internalOrdersApi';
import type { InternalOrder } from '@/types';

// MUI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';

// MUI Icons
import InventoryIcon from '@mui/icons-material/Inventory';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import UndoIcon from '@mui/icons-material/Undo';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';

const S  = '#E8621A';
const SD = '#C44D0D';
const SP = '#FEF0E6';
const GOLD      = '#C9920A';
const GOLD_PALE = '#FFF9E6';
const GREEN      = '#1B7A4A';
const GREEN_PALE = '#E6F5EC';
const BLUE       = '#1565C0';
const BLUE_PALE  = '#E3F0FF';

const TH_SX = {
  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase' as const, color: SD,
  bgcolor: SP, py: 1.5, px: 2,
  borderBottom: '1.5px solid rgba(232,98,26,0.15)',
  whiteSpace: 'nowrap' as const,
};

const TD_SX = {
  fontSize: '0.83rem', color: '#3B1F0A',
  py: 1.5, px: 2,
  borderBottom: '1px solid #F2E8D8',
};

function MealIcon({ meal }: { meal: string }) {
  if (meal === 'Breakfast') return <FreeBreakfastIcon sx={{ fontSize: 14, color: S, mr: 0.5, verticalAlign: 'middle' }} />;
  if (meal === 'Lunch')     return <WbSunnyIcon       sx={{ fontSize: 14, color: GOLD, mr: 0.5, verticalAlign: 'middle' }} />;
  return                           <NightlightIcon    sx={{ fontSize: 14, color: '#7C3AED', mr: 0.5, verticalAlign: 'middle' }} />;
}

function StatusChips({ accepted, delivered }: { accepted: boolean; delivered: boolean }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
      {accepted ? (
        <Box component="span" sx={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, color: GREEN, bgcolor: GREEN_PALE, px: 1.25, py: 0.4, borderRadius: '50px', letterSpacing: '0.04em' }}>
          Accepted
        </Box>
      ) : (
        <Box component="span" sx={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, color: GOLD, bgcolor: GOLD_PALE, px: 1.25, py: 0.4, borderRadius: '50px', letterSpacing: '0.04em' }}>
          Pending
        </Box>
      )}
      {accepted && (
        delivered ? (
          <Box component="span" sx={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, color: GREEN, bgcolor: GREEN_PALE, px: 1.25, py: 0.4, borderRadius: '50px', letterSpacing: '0.04em' }}>
            Delivered
          </Box>
        ) : (
          <Box component="span" sx={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, color: BLUE, bgcolor: BLUE_PALE, px: 1.25, py: 0.4, borderRadius: '50px', letterSpacing: '0.04em' }}>
            In Transit
          </Box>
        )
      )}
    </Box>
  );
}

function OrderModal({ order, onClose }: { order: InternalOrder; onClose: () => void }) {
  const [toggleAccept,  { isLoading: accepting  }] = useToggleAcceptMutation();
  const [toggleDeliver, { isLoading: delivering }] = useToggleDeliverMutation();

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px', border: '1.5px solid #FEF0E6' } } }}>
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: SP, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <InventoryIcon sx={{ fontSize: 20, color: SD }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 700, color: SD, lineHeight: 1.2 }}>
              Internal Order
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#9A7A5A' }}>{order.id}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#9A7A5A' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: '#F2E8D8' }} />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px 12px', mb: 2.5 }}>
          {[
            ['Name',       order.name],
            ['Mobile',     order.mobile],
            ['Date',       new Date(order.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
            ['Department', order.dept],
            ['Location',   order.location],
            ['Plates',     order.count],
          ].map(([label, value]) => (
            <React.Fragment key={String(label)}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#9A7A5A', textTransform: 'uppercase', letterSpacing: '0.07em', pt: 0.3 }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: '0.83rem', color: '#3B1F0A' }}>{value}</Typography>
            </React.Fragment>
          ))}
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#9A7A5A', textTransform: 'uppercase', letterSpacing: '0.07em', pt: 0.5 }}>
            Meal
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MealIcon meal={order.meal} />
            <Typography sx={{ fontSize: '0.83rem', color: '#3B1F0A' }}>{order.meal}</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#9A7A5A', textTransform: 'uppercase', letterSpacing: '0.07em', pt: 0.5 }}>
            Status
          </Typography>
          <StatusChips accepted={order.accepted} delivered={order.delivered} />
        </Box>

        <Divider sx={{ borderColor: '#F2E8D8', mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant={order.accepted ? 'outlined' : 'contained'}
            startIcon={order.accepted ? <UndoIcon sx={{ fontSize: '15px !important' }} /> : <CheckCircleIcon sx={{ fontSize: '15px !important' }} />}
            disabled={accepting}
            onClick={() => toggleAccept(order.id)}
            sx={order.accepted
              ? { borderRadius: '50px', textTransform: 'none', fontSize: '0.78rem', borderColor: '#E8D8C0', color: '#5A3A1A', '&:hover': { bgcolor: SP } }
              : { borderRadius: '50px', textTransform: 'none', fontSize: '0.78rem', bgcolor: GREEN, '&:hover': { bgcolor: '#155A38' } }
            }
          >
            {order.accepted ? 'Undo Accept' : 'Accept Order'}
          </Button>

          {order.accepted && (
            <Button
              size="small"
              variant={order.delivered ? 'outlined' : 'contained'}
              startIcon={order.delivered ? <UndoIcon sx={{ fontSize: '15px !important' }} /> : <LocalShippingIcon sx={{ fontSize: '15px !important' }} />}
              disabled={delivering}
              onClick={() => toggleDeliver(order.id)}
              sx={order.delivered
                ? { borderRadius: '50px', textTransform: 'none', fontSize: '0.78rem', borderColor: '#E8D8C0', color: '#5A3A1A', '&:hover': { bgcolor: SP } }
                : { borderRadius: '50px', textTransform: 'none', fontSize: '0.78rem', bgcolor: S, '&:hover': { bgcolor: SD } }
              }
            >
              {order.delivered ? 'Undo Deliver' : 'Mark Delivered'}
            </Button>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F2E8D8' }}>
        <Button onClick={onClose} sx={{ borderRadius: '50px', textTransform: 'none', color: '#5A3A1A', '&:hover': { bgcolor: SP } }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function InternalOrdersPage() {
  const { data: orders = [], isLoading: oLoad } = useGetInternalOrdersQuery({});
  const [selectedOrder, setSelectedOrder] = useState<InternalOrder | null>(null);

  const pendingCount = orders.filter(o => !o.accepted).length;

  return (
    <Box>
      {/* PAGE HEADER */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <InventoryIcon sx={{ color: SD, fontSize: 28 }} />
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color: SD }}>
            Internal Orders
          </Typography>
          {pendingCount > 0 && (
            <Chip label={`${pendingCount} pending`} size="small"
              sx={{ bgcolor: GOLD_PALE, color: GOLD, fontWeight: 700, fontSize: '0.72rem', borderRadius: '50px', ml: 0.5 }} />
          )}
        </Box>
        <Typography sx={{ fontSize: '0.85rem', color: '#9A7A5A' }}>
          {orders.length} total order{orders.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* TABLE CARD */}
      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['ID', 'Name', 'Department', 'Date', 'Meal', 'Plates', 'Location', 'Status', ''].map(h => (
                  <TableCell key={h} sx={TH_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {oLoad ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#9A7A5A', fontSize: '0.85rem' }}>
                    Loading…
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#9A7A5A', fontSize: '0.85rem' }}>
                    No internal orders yet.
                  </TableCell>
                </TableRow>
              ) : orders.map(o => (
                <TableRow key={o.id} sx={{ '&:hover td': { bgcolor: '#FDFAF4' }, '&:last-child td': { border: 0 } }}>
                  <TableCell sx={TD_SX}>
                    <Box component="span" sx={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, color: SD, bgcolor: SP, px: 1.25, py: 0.4, borderRadius: '50px' }}>
                      {o.id}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, fontWeight: 600 }}>{o.name}</TableCell>
                  <TableCell sx={{ ...TD_SX, fontSize: '0.75rem', color: '#5A3A1A' }}>{o.dept}</TableCell>
                  <TableCell sx={{ ...TD_SX, color: '#9A7A5A', whiteSpace: 'nowrap' }}>
                    {new Date(o.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell sx={TD_SX}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MealIcon meal={o.meal} />
                      <Typography sx={{ fontSize: '0.83rem' }}>{o.meal}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, fontWeight: 700 }}>{o.count}</TableCell>
                  <TableCell sx={{ ...TD_SX, color: '#5A3A1A' }}>{o.location}</TableCell>
                  <TableCell sx={TD_SX}>
                    <StatusChips accepted={o.accepted} delivered={o.delivered} />
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, pr: 1.5 }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon sx={{ fontSize: '14px !important' }} />}
                      onClick={() => setSelectedOrder(o)}
                      sx={{
                        borderRadius: '50px', textTransform: 'none', fontSize: '0.75rem',
                        color: SD, border: '1.5px solid rgba(232,98,26,0.3)',
                        px: 1.5, py: 0.4, fontWeight: 600,
                        '&:hover': { bgcolor: SP },
                      }}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ px: 3, py: 1.25, borderTop: '1px solid #F2E8D8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#9A7A5A' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </Typography>
          {pendingCount > 0 && (
            <Typography sx={{ fontSize: '0.75rem', color: GOLD, fontWeight: 600 }}>
              {pendingCount} awaiting acceptance
            </Typography>
          )}
        </Box>
      </Card>

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </Box>
  );
}
