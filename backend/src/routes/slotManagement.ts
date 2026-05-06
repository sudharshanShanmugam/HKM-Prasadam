/**
 * @swagger
 * tags:
 *   name: Slot Management
 *   description: Slot calendar, rate editor, configured slots, and monthly booking summary
 */

import { Router, Request, Response } from 'express';
import SlotDate from '../models/SlotDate';
import PrasadamBooking from '../models/PrasadamBooking';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// ─── Slot Management (Calendar) ───────────────────────────────────────────────

/**
 * @swagger
 * /api/slot-management:
 *   get:
 *     summary: All slot dates for calendar view
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of slot dates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SlotDate' }
 */
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const slots = await SlotDate.find().sort({ date: 1 });
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// ─── Configured Slots ─────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/slot-management/configured:
 *   get:
 *     summary: Slots with custom price overrides, labels, or removed meals
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of configured slot dates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SlotDate' }
 */
router.get('/configured', requireAuth, async (_req: Request, res: Response) => {
  try {
    const slots = await SlotDate.find({
      $or: [
        { 'priceOverrides.Breakfast': { $exists: true, $ne: null } },
        { 'priceOverrides.Lunch':     { $exists: true, $ne: null } },
        { 'priceOverrides.Dinner':    { $exists: true, $ne: null } },
        { isFestival: true },
        { stopped: true },
        { 'mealStatus.Breakfast.removed': true },
        { 'mealStatus.Lunch.removed':     true },
        { 'mealStatus.Dinner.removed':    true },
      ],
    }).sort({ date: 1 });

    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// ─── Monthly Booking Summary ──────────────────────────────────────────────────

/**
 * @swagger
 * /api/slot-management/monthly-summary:
 *   get:
 *     summary: Coupon counts per date per meal for a given month
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         schema: { type: string, example: '2025-08' }
 *         description: Month in YYYY-MM format (defaults to current month)
 *     responses:
 *       200:
 *         description: Map of date to meal counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 month:   { type: string }
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       Breakfast: { type: number }
 *                       Lunch:     { type: number }
 *                       Dinner:    { type: number }
 *                       total:     { type: number }
 *                       count:     { type: number }
 */
router.get('/monthly-summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const month = String(req.query.month || new Date().toISOString().slice(0, 7));

    const bookings = await PrasadamBooking.find({
      date: { $regex: `^${month}` },
    });

    // Build map: { 'YYYY-MM-DD': { Breakfast, Lunch, Dinner, total, count } }
    const summary: Record<string, { Breakfast: number; Lunch: number; Dinner: number; total: number; count: number }> = {};

    for (const b of bookings) {
      if (!summary[b.date]) {
        summary[b.date] = { Breakfast: 0, Lunch: 0, Dinner: 0, total: 0, count: 0 };
      }
      summary[b.date].Breakfast += b.meals.Breakfast;
      summary[b.date].Lunch     += b.meals.Lunch;
      summary[b.date].Dinner    += b.meals.Dinner;
      summary[b.date].total     += b.meals.Breakfast + b.meals.Lunch + b.meals.Dinner;
      summary[b.date].count     += 1;
    }

    res.json({ success: true, data: summary, month });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// ─── Slot Rate Editor ─────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/slot-management/{date}:
 *   get:
 *     summary: Get a single slot with booking counts (rate editor data)
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: '2025-08-15' }
 *     responses:
 *       200:
 *         description: Slot config and booking breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     slot:          { $ref: '#/components/schemas/SlotDate' }
 *                     totalBookings: { type: number }
 *                     bookingCounts:
 *                       type: object
 *                       properties:
 *                         Thiruvanmiyur: { $ref: '#/components/schemas/Meals' }
 *                         NLBR:          { $ref: '#/components/schemas/Meals' }
 *   put:
 *     summary: Upsert full slot config for a date
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SlotDate' }
 *     responses:
 *       200:
 *         description: Upserted slot
 *   patch:
 *     summary: Partial update of a slot config
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SlotDate' }
 *     responses:
 *       200:
 *         description: Updated slot
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a slot date
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.get('/:date', requireAuth, async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const slot     = await SlotDate.findOne({ date });

    const bookings = await PrasadamBooking.find({ date });
    const bookingCounts = {
      Thiruvanmiyur: { Breakfast: 0, Lunch: 0, Dinner: 0, total: 0 },
      NLBR:          { Breakfast: 0, Lunch: 0, Dinner: 0, total: 0 },
    };
    for (const b of bookings) {
      const loc = b.location as 'Thiruvanmiyur' | 'NLBR';
      if (bookingCounts[loc]) {
        bookingCounts[loc].Breakfast += b.meals.Breakfast;
        bookingCounts[loc].Lunch     += b.meals.Lunch;
        bookingCounts[loc].Dinner    += b.meals.Dinner;
        bookingCounts[loc].total     += b.meals.Breakfast + b.meals.Lunch + b.meals.Dinner;
      }
    }

    res.json({ success: true, data: { slot: slot ?? null, bookingCounts, totalBookings: bookings.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// PUT /api/slot-management/:date
// Upsert full slot config for a date
router.put('/:date', requireAuth, async (req: Request, res: Response) => {
  try {
    const slot = await SlotDate.findOneAndUpdate(
      { date: req.params.date },
      { ...req.body, date: req.params.date },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

// PATCH /api/slot-management/:date
// Partial update of slot config
router.patch('/:date', requireAuth, async (req: Request, res: Response) => {
  try {
    const slot = await SlotDate.findOneAndUpdate(
      { date: req.params.date },
      req.body,
      { new: true }
    );
    if (!slot) { res.status(404).json({ success: false, message: 'Slot not found' }); return; }
    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

// DELETE /api/slot-management/:date
router.delete('/:date', requireAuth, async (req: Request, res: Response) => {
  try {
    await SlotDate.findOneAndDelete({ date: req.params.date });
    res.json({ success: true, message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
