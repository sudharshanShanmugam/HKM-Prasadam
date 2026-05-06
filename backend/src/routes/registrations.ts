/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Admin view of all prasadam coupon bookings
 */

import { Router, Request, Response } from 'express';
import Registration from '../models/Registration';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

/**
 * @swagger
 * /api/registrations:
 *   get:
 *     summary: List all registrations
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, mobile, or ID
 *       - in: query
 *         name: location
 *         schema: { type: string, enum: [Thiruvanmiyur, NLBR] }
 *       - in: query
 *         name: date
 *         schema: { type: string }
 *         description: Filter by date (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, declined] }
 *     responses:
 *       200:
 *         description: Array of bookings with meta counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PrasadamBooking' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     count:        { type: number }
 *                     totalCoupons: { type: number }
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.query.location) filter.location = req.query.location;

    if (req.query.dateFrom || req.query.dateTo) {
      const range: Record<string, string> = {};
      if (req.query.dateFrom) range.$gte = String(req.query.dateFrom);
      if (req.query.dateTo)   range.$lte = String(req.query.dateTo);
      filter.date = range;
    } else if (req.query.date) {
      filter.date = req.query.date;
    }

    if (req.query.search) {
      const s = String(req.query.search);
      filter.$or = [
        { name:   { $regex: s, $options: 'i' } },
        { mobile: { $regex: s, $options: 'i' } },
        { id:     { $regex: s, $options: 'i' } },
      ];
    }

    const registrations = await Registration.find(filter).sort({ approvedAt: -1 });

    const totalCoupons = registrations.reduce(
      (s, r) => s + r.meals.Breakfast + r.meals.Lunch + r.meals.Dinner, 0
    );

    res.json({ success: true, data: registrations, meta: { count: registrations.length, totalCoupons } });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

/**
 * @swagger
 * /api/registrations/{id}:
 *   get:
 *     summary: Get a single registration by ID
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/PrasadamBooking' }
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a registration
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const registration = await Registration.findOne({ id: req.params.id });
    if (!registration) { res.status(404).json({ success: false, message: 'Registration not found' }); return; }
    res.json({ success: true, data: registration });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await Registration.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Registration deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
