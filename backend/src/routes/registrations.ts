import { Router, Request, Response } from 'express';
import Registration from '../models/Registration';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();


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
