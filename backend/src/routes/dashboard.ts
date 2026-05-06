/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin dashboard stats and today's slot overview
 */

import { Router, Request, Response } from 'express';
import PrasadamBooking from '../models/PrasadamBooking';
import SlotDate from '../models/SlotDate';
import PartyEnquiry from '../models/PartyEnquiry';
import InternalOrder from '../models/InternalOrder';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

/**
 * @swagger
 * /api/dashboard/today-slots:
 *   get:
 *     summary: Today's slot details and booking counts per meal per location
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's slot and booking breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:          { type: string }
 *                     slot:          { $ref: '#/components/schemas/SlotDate' }
 *                     totalBookings: { type: number }
 *                     bookings:
 *                       type: object
 *                       properties:
 *                         Thiruvanmiyur: { $ref: '#/components/schemas/Meals' }
 *                         NLBR:          { $ref: '#/components/schemas/Meals' }
 */
// GET /api/dashboard/today-slots
router.get('/today-slots', requireAuth, async (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const slot  = await SlotDate.findOne({ date: today });

    const bookings = await PrasadamBooking.find({ date: today });

    const counts = {
      Thiruvanmiyur: { Breakfast: 0, Lunch: 0, Dinner: 0, total: 0 },
      NLBR:          { Breakfast: 0, Lunch: 0, Dinner: 0, total: 0 },
    };

    for (const b of bookings) {
      const loc = b.location as 'Thiruvanmiyur' | 'NLBR';
      if (counts[loc]) {
        counts[loc].Breakfast += b.meals.Breakfast;
        counts[loc].Lunch     += b.meals.Lunch;
        counts[loc].Dinner    += b.meals.Dinner;
        counts[loc].total     += b.meals.Breakfast + b.meals.Lunch + b.meals.Dinner;
      }
    }

    res.json({
      success: true,
      data: {
        date:     today,
        slot:     slot ?? null,
        bookings: counts,
        totalBookings: bookings.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Summary counts for dashboard cards
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBookings:    { type: number }
 *                     todayBookings:    { type: number }
 *                     totalCoupons:     { type: number }
 *                     pendingPayments:  { type: number }
 *                     pendingEnquiries: { type: number }
 *                     pendingOrders:    { type: number }
 */
router.get('/stats', requireAuth, async (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [
      totalBookings,
      todayBookings,
      pendingPayments,
      pendingEnquiries,
      pendingOrders,
    ] = await Promise.all([
      PrasadamBooking.countDocuments(),
      PrasadamBooking.countDocuments({ date: today }),
      PrasadamBooking.countDocuments({ status: 'pending' }),
      PartyEnquiry.countDocuments({ status: 'pending' }),
      InternalOrder.countDocuments({ accepted: false }),
    ]);

    const couponAgg = await PrasadamBooking.aggregate([
      { $group: { _id: null, total: { $sum: { $add: ['$meals.Breakfast', '$meals.Lunch', '$meals.Dinner'] } } } },
    ]);
    const totalCoupons = couponAgg[0]?.total ?? 0;

    res.json({
      success: true,
      data: {
        totalBookings,
        todayBookings,
        totalCoupons,
        pendingPayments,
        pendingEnquiries,
        pendingOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
