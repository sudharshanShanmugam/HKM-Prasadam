'use client';
import React, { useState } from 'react';
import { useGetInternalOrdersQuery, useToggleAcceptMutation, useToggleDeliverMutation } from '@/services/internalOrdersApi';
import { mealIcon, CLR, pill, SectionCard, StatusPill, Btn, Th, Td, EmptyRow, LoadingRow, Modal, DetailGrid } from './shared';
import type { InternalOrder } from '@/types';

function OrderModal({ order, onClose }: { order: InternalOrder; onClose: () => void }) {
  const [toggleAccept] = useToggleAcceptMutation();
  const [toggleDeliver] = useToggleDeliverMutation();
  return (
    <Modal title={`Order — ${order.id}`} onClose={onClose}>
      <DetailGrid rows={[
        ['Name', order.name],
        ['Mobile', order.mobile],
        ['Date', order.date],
        ['Department', order.dept],
        ['Meal', <React.Fragment key="meal">{mealIcon(order.meal)} {order.meal}</React.Fragment>],
        ['Plates', order.count],
        ['Location', order.location],
        ['Status', <span key="status" style={{ display: 'flex', gap: 6 }}>
          <StatusPill s={order.accepted ? 'accepted' : 'pending'} />
          {order.accepted && <StatusPill s={order.delivered ? 'delivered' : 'in-transit'} />}
        </span>],
      ]} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant={order.accepted ? 'ghost' : 'success'} onClick={() => toggleAccept(order.id)}>
          {order.accepted ? '↩ Undo Accept' : '✓ Accept Order'}
        </Btn>
        {order.accepted && (
          <Btn variant={order.delivered ? 'ghost' : 'primary'} onClick={() => toggleDeliver(order.id)}>
            {order.delivered ? '↩ Undo Deliver' : '🚚 Mark Delivered'}
          </Btn>
        )}
      </div>
    </Modal>
  );
}

export default function InternalOrdersPage() {
  const { data: orders = [], isLoading: oLoad } = useGetInternalOrdersQuery({});
  const [selectedOrder, setSelectedOrder] = useState<InternalOrder | null>(null);

  const pendingOrders = orders.filter(o => !o.accepted).length;

  return (
    <>
      <SectionCard title="Internal Orders"
        action={pendingOrders > 0 ? <span style={pill(CLR.gold, CLR.goldPale)}>{pendingOrders} pending</span> : undefined}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th>ID</Th><Th>Name</Th><Th>Department</Th><Th>Date</Th>
              <Th>Meal</Th><Th>Plates</Th><Th>Location</Th><Th>Status</Th><Th>Action</Th>
            </tr></thead>
            <tbody>
              {oLoad ? <LoadingRow cols={9} /> :
                orders.length === 0 ? <EmptyRow cols={9} msg="No internal orders yet." /> :
                  orders.map(o => (
                    <tr key={o.id}>
                      <Td><span style={pill(CLR.saffronDark, CLR.saffronPale)}>{o.id}</span></Td>
                      <Td style={{ fontWeight: 500 }}>{o.name}</Td>
                      <Td style={{ fontSize: 11, color: CLR.textMid }}>{o.dept}</Td>
                      <Td style={{ color: CLR.textLight }}>{o.date}</Td>
                      <Td>{mealIcon(o.meal)} {o.meal}</Td>
                      <Td style={{ fontWeight: 700 }}>{o.count}</Td>
                      <Td style={{ color: CLR.textMid }}>{o.location}</Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <StatusPill s={o.accepted ? 'accepted' : 'pending'} />
                          {o.accepted && <StatusPill s={o.delivered ? 'delivered' : 'in-transit'} />}
                        </div>
                      </Td>
                      <Td><Btn sm variant="ghost" onClick={() => setSelectedOrder(o)}>👁 Details</Btn></Td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </>
  );
}
