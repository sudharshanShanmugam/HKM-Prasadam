import { Router, Request, Response } from 'express';
import InternalOrder from '../models/InternalOrder';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.mobile)    filter.mobile    = req.query.mobile;
    if (req.query.dept)      filter.dept      = req.query.dept;
    if (req.query.date)      filter.date      = req.query.date;
    if (req.query.accepted  !== undefined) filter.accepted  = req.query.accepted  === 'true';
    if (req.query.delivered !== undefined) filter.delivered = req.query.delivered === 'true';
    const orders = await InternalOrder.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await InternalOrder.findOne({ id: req.params.id });
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const order = new InternalOrder(req.body);
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.patch('/:id/accept', requireAuth, async (req: Request, res: Response) => {
  try {
    const order = await InternalOrder.findOne({ id: req.params.id });
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
    order.accepted = !order.accepted;
    if (!order.accepted) order.delivered = false;
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.patch('/:id/deliver', requireAuth, async (req: Request, res: Response) => {
  try {
    const order = await InternalOrder.findOne({ id: req.params.id });
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
    if (!order.accepted) { res.status(400).json({ success: false, message: 'Order must be accepted before delivery' }); return; }
    order.delivered = !order.delivered;
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await InternalOrder.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
