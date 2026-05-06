/**
 * @swagger
 * tags:
 *   name: Prasadam Bookings
 *   description: Public prasadam coupon bookings
 *
 * /api/prasadam-bookings:
 *   get:
 *     summary: List bookings (filterable by mobile, date, status)
 *     tags: [Prasadam Bookings]
 *     parameters:
 *       - in: query
 *         name: mobile
 *         schema: { type: string }
 *         description: Filter by mobile number
 *       - in: query
 *         name: date
 *         schema: { type: string, example: '2025-08-15' }
 *         description: Filter by booking date
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, declined] }
 *     responses:
 *       200:
 *         description: Array of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PrasadamBooking' }
 *   post:
 *     summary: Submit a new prasadam booking (public)
 *     tags: [Prasadam Bookings]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PrasadamBooking' }
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error
 *
 * /api/prasadam-bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Prasadam Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: 'HKM-12345' }
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/PrasadamBooking' }
 *       404:
 *         description: Booking not found
 *   delete:
 *     summary: Delete a booking (admin)
 *     tags: [Prasadam Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking deleted
 *
 * /api/prasadam-bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (admin)
 *     tags: [Prasadam Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, approved, declined] }
 *     responses:
 *       200:
 *         description: Updated booking
 *       404:
 *         description: Booking not found
 */

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
