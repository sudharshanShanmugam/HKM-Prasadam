import { Router, Request, Response } from 'express';
import Settings from '../models/Settings';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();


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
