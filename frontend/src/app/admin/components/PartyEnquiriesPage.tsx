'use client';
import React, { useState } from 'react';
import { useGetPartyEnquiriesQuery, useUpdatePartyEnquiryMutation } from '@/services/partyEnquiriesApi';
import { ALL_MEALS, mealIcon, CLR, pill, SectionCard, StatusPill, Btn, Th, Td, EmptyRow, LoadingRow, Modal, DetailGrid, inputSt } from './shared';
import type { PartyEnquiry, UpdatePartyEnquiryDto, EnquiryStatus } from '@/types';

function EnquiryModal({ eq, onClose }: { eq: PartyEnquiry; onClose: () => void }) {
  const [updateEnquiry] = useUpdatePartyEnquiryMutation();
  const [confirmedMenu, setConfirmedMenu] = useState(eq.confirmedMenu ?? '');
  const [confirmedPrice, setConfirmedPrice] = useState(eq.confirmedPrice ?? 0);
  const update = async (data: UpdatePartyEnquiryDto) => { await updateEnquiry({ id: eq.id, data }); };
  const totalPlates = eq.meals.Breakfast + eq.meals.Lunch + eq.meals.Dinner;
  return (
    <Modal title={`Enquiry — ${eq.id}`} onClose={onClose} width={500}>
      <DetailGrid rows={[
        ['Name', eq.name],
        ['Mobile', eq.mobile],
        ['Event Date', eq.eventDate],
        ['Address', eq.address],
        ['Plates', `${totalPlates} (${ALL_MEALS.filter(m => eq.meals[m] > 0).map(m => `${mealIcon(m)}${eq.meals[m]}`).join(' ')})`],
        ['Pref. Menu', eq.preferredMenu || '—'],
        ['Pref. Price', eq.preferredPrice ? `₹${eq.preferredPrice}` : '—'],
        ['Status', <div key="status" style={{ display: 'flex', gap: 6 }}><StatusPill s={eq.status} />{eq.paid && <StatusPill s="paid" />}</div>],
      ]} />

      {/* Confirm menu & price */}
      <div style={{ borderTop: `1px solid ${CLR.borderLight}`, paddingTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: CLR.textMid, marginBottom: 10 }}>Confirm Quote</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input style={inputSt} placeholder="Confirmed Menu" value={confirmedMenu} onChange={e => setConfirmedMenu(e.target.value)} />
          <input style={inputSt} type="number" placeholder="Confirmed Price (₹)" value={confirmedPrice || ''} onChange={e => setConfirmedPrice(Number(e.target.value))} />
          <Btn onClick={() => update({ confirmedMenu, confirmedPrice })}>💾 Save Quote</Btn>
        </div>
      </div>

      {/* Status buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['pending', 'accepted', 'declined'] as EnquiryStatus[]).map(s => (
          <Btn key={s}
            variant={s === 'accepted' ? 'success' : s === 'declined' ? 'danger' : 'ghost'}
            style={{ opacity: eq.status === s ? 0.4 : 1 }}
            onClick={() => update({ status: s })}>
            {s === 'accepted' ? '✓ Accept' : s === 'declined' ? '✗ Decline' : '↩ Reset'}
          </Btn>
        ))}
        <Btn variant={eq.paid ? 'ghost' : 'primary'} onClick={() => update({ paid: !eq.paid })}>
          {eq.paid ? 'Mark Unpaid' : '💳 Mark Paid'}
        </Btn>
      </div>
    </Modal>
  );
}

export default function PartyEnquiriesPage() {
  const { data: enquiries = [], isLoading: eLoad } = useGetPartyEnquiriesQuery({});
  const [selectedEnquiry, setSelectedEnquiry] = useState<PartyEnquiry | null>(null);

  const pendingEnquiries = enquiries.filter(e => e.status === 'pending').length;

  return (
    <>
      <SectionCard title="Party Enquiries"
        action={pendingEnquiries > 0 ? <span style={pill(CLR.gold, CLR.goldPale)}>{pendingEnquiries} pending</span> : undefined}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th>ID</Th><Th>Name</Th><Th>Mobile</Th><Th>Event Date</Th>
              <Th>Address</Th><Th>Plates</Th><Th>Status</Th><Th>Paid</Th><Th>Action</Th>
            </tr></thead>
            <tbody>
              {eLoad ? <LoadingRow cols={9} /> :
                enquiries.length === 0 ? <EmptyRow cols={9} msg="No party enquiries yet." /> :
                  enquiries.map(e => {
                    const total = e.meals.Breakfast + e.meals.Lunch + e.meals.Dinner;
                    return (
                      <tr key={e.id}>
                        <Td><span style={pill(CLR.gold, CLR.goldPale)}>{e.id}</span></Td>
                        <Td style={{ fontWeight: 500 }}>{e.name}</Td>
                        <Td style={{ color: CLR.textMid }}>{e.mobile}</Td>
                        <Td style={{ color: CLR.textLight }}>{e.eventDate}</Td>
                        <Td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: CLR.textMid, fontSize: 12 }}>{e.address}</Td>
                        <Td style={{ fontWeight: 700 }}>{total}</Td>
                        <Td><StatusPill s={e.status} /></Td>
                        <Td>{e.paid ? <StatusPill s="paid" /> : <span style={pill(CLR.textLight, CLR.cream)}>Unpaid</span>}</Td>
                        <Td><Btn sm variant="ghost" onClick={() => setSelectedEnquiry(e)}>👁 View</Btn></Td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {selectedEnquiry && <EnquiryModal eq={selectedEnquiry} onClose={() => setSelectedEnquiry(null)} />}
    </>
  );
}
