/**
 * @swagger
 * tags:
 *   name: Festivals
 *   description: Festival calendar management
 *
 * /api/festivals:
 *   get:
 *     summary: List all festivals sorted by date
 *     tags: [Festivals]
 *     responses:
 *       200:
 *         description: Array of festivals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:  { type: string }
 *                       date: { type: string, example: '2025-08-15' }
 *                       name: { type: string, example: 'Janmashtami' }
 *   post:
 *     summary: Create a new festival (admin)
 *     tags: [Festivals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, name]
 *             properties:
 *               date: { type: string, example: '2025-08-15' }
 *               name: { type: string, example: 'Janmashtami' }
 *     responses:
 *       201:
 *         description: Created festival
 *
 * /api/festivals/{id}:
 *   put:
 *     summary: Update a festival (admin)
 *     tags: [Festivals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date: { type: string }
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Updated festival
 *       404:
 *         description: Festival not found
 *   delete:
 *     summary: Delete a festival (admin)
 *     tags: [Festivals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Festival deleted
 */

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
