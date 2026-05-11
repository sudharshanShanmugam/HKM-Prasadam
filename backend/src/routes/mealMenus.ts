import { Router, Request, Response } from 'express';
import MealMenu from '../models/MealMenu';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const menus = await MealMenu.find().sort({ date: 1 });
    const map: Record<string, unknown> = {};
    menus.forEach(m => { map[m.date] = m.meals; });
    res.json({ success: true, data: map });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:date', async (req: Request, res: Response) => {
  try {
    const menu = await MealMenu.findOne({ date: req.params.date });
    if (!menu) { res.status(404).json({ success: false, message: 'No menu for this date' }); return; }
    res.json({ success: true, data: menu });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:date', requireAuth, async (req: Request, res: Response) => {
  try {
    const menu = await MealMenu.findOneAndUpdate(
      { date: req.params.date },
      { date: req.params.date, meals: req.body.meals },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: menu });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:date', requireAuth, async (req: Request, res: Response) => {
  try {
    await MealMenu.findOneAndDelete({ date: req.params.date });
    res.json({ success: true, message: 'Menu deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
