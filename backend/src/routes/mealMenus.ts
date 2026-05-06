/**
 * @swagger
 * tags:
 *   name: Meal Menus
 *   description: Daily meal menu management
 *
 * /api/meal-menus:
 *   get:
 *     summary: Get all meal menus as a date→meals map
 *     tags: [Meal Menus]
 *     responses:
 *       200:
 *         description: Map of date to meal menu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *
 * /api/meal-menus/{date}:
 *   get:
 *     summary: Get meal menu for a specific date
 *     tags: [Meal Menus]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: '2025-08-15' }
 *     responses:
 *       200:
 *         description: Meal menu for the date
 *       404:
 *         description: No menu for this date
 *   put:
 *     summary: Create or update meal menu for a date (admin)
 *     tags: [Meal Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: '2025-08-15' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meals:
 *                 type: object
 *                 properties:
 *                   Breakfast: { type: string }
 *                   Lunch:     { type: string }
 *                   Dinner:    { type: string }
 *     responses:
 *       200:
 *         description: Saved meal menu
 *   delete:
 *     summary: Delete meal menu for a date (admin)
 *     tags: [Meal Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: '2025-08-15' }
 *     responses:
 *       200:
 *         description: Menu deleted
 */

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
