/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin dashboard stats and today's slot overview
 */

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
