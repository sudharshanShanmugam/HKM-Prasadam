import { Router, Request, Response } from 'express';
import Festival from '../models/Festival';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const festivals = await Festival.find().sort({ date: 1 });
    res.json({ success: true, data: festivals });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const festival = new Festival(req.body);
    await festival.save();
    res.status(201).json({ success: true, data: festival });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const festival = await Festival.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!festival) { res.status(404).json({ success: false, message: 'Festival not found' }); return; }
    res.json({ success: true, data: festival });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Festival.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Festival deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
