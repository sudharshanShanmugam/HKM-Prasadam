/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Default meal rates, slot limits, and booking window configuration
 */

import { Router, Request, Response } from 'express';
import Settings from '../models/Settings';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get default settings (creates with defaults if none exist)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Settings' }
 *   put:
 *     summary: Update all settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Settings' }
 *     responses:
 *       200:
 *         description: Updated settings
 */
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// PUT /api/settings
// Upserts the settings document
router.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const allowed = [
      'defaultMealRates',
      'defaultSlotLimits',
      'bookingWindowOpen',
      'bookingWindowClose',
      'bookingOpenDays',
      'bookingCloseDays',
    ];
    const update: Record<string, unknown> = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

/**
 * @swagger
 * /api/settings/meal-rates:
 *   patch:
 *     summary: Update default meal rates only
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Meals' }
 *     responses:
 *       200:
 *         description: Updated settings
 */
router.patch('/meal-rates', requireAuth, async (req: Request, res: Response) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { defaultMealRates: req.body } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

/**
 * @swagger
 * /api/settings/slot-limits:
 *   patch:
 *     summary: Update default slot limits per location
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Thiruvanmiyur: { $ref: '#/components/schemas/Meals' }
 *               NLBR:          { $ref: '#/components/schemas/Meals' }
 *     responses:
 *       200:
 *         description: Updated settings
 */
router.patch('/slot-limits', requireAuth, async (req: Request, res: Response) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { defaultSlotLimits: req.body } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

/**
 * @swagger
 * /api/settings/booking-window:
 *   patch:
 *     summary: Update booking window auto-open / auto-close config
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingWindowOpen:  { type: boolean }
 *               bookingWindowClose: { type: boolean }
 *               bookingOpenDays:    { type: number }
 *               bookingCloseDays:   { type: number }
 *     responses:
 *       200:
 *         description: Updated settings
 */
router.patch('/booking-window', requireAuth, async (req: Request, res: Response) => {
  try {
    const allowed = ['bookingWindowOpen', 'bookingWindowClose', 'bookingOpenDays', 'bookingCloseDays'];
    const update: Record<string, unknown> = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

export default router;
