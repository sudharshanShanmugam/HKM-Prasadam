import { Router, Request, Response } from 'express';
import PrasadamBooking from '../models/PrasadamBooking';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.mobile) filter.mobile = req.query.mobile;
    if (req.query.date)   filter.date   = req.query.date;
    if (req.query.status) filter.status = req.query.status;
    const bookings = await PrasadamBooking.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const booking = await PrasadamBooking.findOne({ id: req.params.id });
    if (!booking) { res.status(404).json({ success: false, message: 'Booking not found' }); return; }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const booking = new PrasadamBooking(req.body);
    await booking.save();
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const booking = await PrasadamBooking.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    if (!booking) { res.status(404).json({ success: false, message: 'Booking not found' }); return; }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await PrasadamBooking.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
