/**
 * @swagger
 * tags:
 *   name: Party Enquiries
 *   description: Door-delivery party prasadam enquiries
 *
 * /api/party-enquiries:
 *   get:
 *     summary: List party enquiries
 *     tags: [Party Enquiries]
 *     parameters:
 *       - in: query
 *         name: mobile
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, accepted, declined] }
 *     responses:
 *       200:
 *         description: Array of enquiries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PartyEnquiry' }
 *   post:
 *     summary: Submit a new party enquiry (public)
 *     tags: [Party Enquiries]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartyEnquiry' }
 *     responses:
 *       201:
 *         description: Created enquiry
 *
 * /api/party-enquiries/{id}:
 *   get:
 *     summary: Get a single party enquiry by ID
 *     tags: [Party Enquiries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: 'ENQ-12345' }
 *     responses:
 *       200:
 *         description: Enquiry details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/PartyEnquiry' }
 *       404:
 *         description: Enquiry not found
 *   patch:
 *     summary: Update enquiry status, payment, or confirmed quote (admin)
 *     tags: [Party Enquiries]
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
 *               status:         { type: string, enum: [pending, accepted, declined] }
 *               paid:           { type: boolean }
 *               confirmedMenu:  { type: string }
 *               confirmedPrice: { type: number }
 *     responses:
 *       200:
 *         description: Updated enquiry
 *   delete:
 *     summary: Delete an enquiry (admin)
 *     tags: [Party Enquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */

import { Router, Request, Response } from 'express';
import PartyEnquiry from '../models/PartyEnquiry';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.mobile) filter.mobile = req.query.mobile;
    if (req.query.status) filter.status = req.query.status;
    const enquiries = await PartyEnquiry.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const enquiry = await PartyEnquiry.findOne({ id: req.params.id });
    if (!enquiry) { res.status(404).json({ success: false, message: 'Enquiry not found' }); return; }
    res.json({ success: true, data: enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const enquiry = new PartyEnquiry(req.body);
    await enquiry.save();
    res.status(201).json({ success: true, data: enquiry });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const allowed = ['status', 'paid', 'confirmedMenu', 'confirmedPrice', 'mealPrices', 'meals'];
    const update: Record<string, unknown> = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const enquiry = await PartyEnquiry.findOneAndUpdate({ id: req.params.id }, update, { new: true });
    if (!enquiry) { res.status(404).json({ success: false, message: 'Enquiry not found' }); return; }
    res.json({ success: true, data: enquiry });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await PartyEnquiry.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
