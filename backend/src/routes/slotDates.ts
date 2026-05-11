import { Router, Request, Response } from 'express';
import SlotDate from '../models/SlotDate';
import Settings from '../models/Settings';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Public: returns { date: meals[] } map with only active meals
// Applies auto-open / auto-close window rules from Settings when enabled.
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await Settings.findOne();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter: Record<string, unknown> = { stopped: false };
    const dateFilter: Record<string, string> = {};

    if (settings?.bookingWindowOpen) {
      // Only show dates whose booking window has opened (event is within openDays from today)
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() + settings.bookingOpenDays);
      dateFilter.$lte = cutoff.toISOString().slice(0, 10);
    }

    if (settings?.bookingWindowClose) {
      // Only show dates whose booking window hasn't closed yet (event is more than closeDays away)
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() + settings.bookingCloseDays);
      dateFilter.$gt = cutoff.toISOString().slice(0, 10);
    }

    if (Object.keys(dateFilter).length > 0) filter.date = dateFilter;

    const slots = await SlotDate.find(filter).sort({ date: 1 });
    const map: Record<string, string[]> = {};
    slots.forEach(s => {
      map[s.date] = s.meals.filter(
        m => !s.mealStatus?.[m as 'Breakfast' | 'Lunch' | 'Dinner']?.stopped &&
             !s.mealStatus?.[m as 'Breakfast' | 'Lunch' | 'Dinner']?.removed
      );
    });
    res.json({ success: true, data: map });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

// Admin: full slot details
router.get('/admin', requireAuth, async (_req: Request, res: Response) => {
  try {
    const slots = await SlotDate.find().sort({ date: 1 });
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:date', async (req: Request, res: Response) => {
  try {
    const slot = await SlotDate.findOne({ date: req.params.date });
    if (!slot) { res.status(404).json({ success: false, message: 'Slot not found' }); return; }
    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const slot = new SlotDate(req.body);
    await slot.save();
    res.status(201).json({ success: true, data: slot });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

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

router.patch('/:date', requireAuth, async (req: Request, res: Response) => {
  try {
    const slot = await SlotDate.findOneAndUpdate({ date: req.params.date }, req.body, { new: true });
    if (!slot) { res.status(404).json({ success: false, message: 'Slot not found' }); return; }
    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:date', requireAuth, async (req: Request, res: Response) => {
  try {
    await SlotDate.findOneAndDelete({ date: req.params.date });
    res.json({ success: true, message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
