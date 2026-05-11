import { Router, Request, Response } from 'express';
import PrasadamBooking from '../models/PrasadamBooking';
import Registration from '../models/Registration';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();


router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.location) filter.location = req.query.location;

    if (req.query.search) {
      const s = String(req.query.search);
      filter.$or = [
        { name:   { $regex: s, $options: 'i' } },
        { mobile: { $regex: s, $options: 'i' } },
        { id:     { $regex: s, $options: 'i' } },
      ];
    }

    const bookings = await PrasadamBooking.find(filter).sort({ createdAt: -1 });

    const summary = {
      total:    await PrasadamBooking.countDocuments(),
      pending:  await PrasadamBooking.countDocuments({ status: 'pending' }),
      approved: await PrasadamBooking.countDocuments({ status: 'approved' }),
      declined: await PrasadamBooking.countDocuments({ status: 'declined' }),
    };

    res.json({ success: true, data: bookings, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});


router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const booking = await PrasadamBooking.findOne({ id: req.params.id });
    if (!booking) { res.status(404).json({ success: false, message: 'Booking not found' }); return; }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});


router.patch('/:id/approve', requireAuth, async (req: Request, res: Response) => {
  try {
    const booking = await PrasadamBooking.findOneAndUpdate(
      { id: req.params.id },
      { status: 'approved' },
      { new: true }
    );
    if (!booking) { res.status(404).json({ success: false, message: 'Booking not found' }); return; }

    // Create a Registration record if one doesn't already exist
    const existing = await Registration.findOne({ bookingId: booking.id });
    if (!existing) {
      await Registration.create({
        bookingId: booking.id,
        name:      booking.name,
        mobile:    booking.mobile,
        email:     booking.email,
        location:  booking.location,
        date:      booking.date,
        meals:     booking.meals,
        total:     booking.total,
        submitted: booking.submitted,
        approvedAt: new Date(),
      });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});


router.patch('/:id/decline', requireAuth, async (req: Request, res: Response) => {
  try {
    const booking = await PrasadamBooking.findOneAndUpdate(
      { id: req.params.id },
      { status: 'declined' },
      { new: true }
    );
    if (!booking) { res.status(404).json({ success: false, message: 'Booking not found' }); return; }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});


router.patch('/:id/mismatch', requireAuth, async (req: Request, res: Response) => {
  try {
    const { note } = req.body;
    const booking = await PrasadamBooking.findOneAndUpdate(
      { id: req.params.id },
      { status: 'declined', mismatchNote: note ?? '' },
      { new: true }
    );
    if (!booking) { res.status(404).json({ success: false, message: 'Booking not found' }); return; }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'declined'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' }); return;
    }
    const booking = await PrasadamBooking.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (!booking) { res.status(404).json({ success: false, message: 'Booking not found' }); return; }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

export default router;
