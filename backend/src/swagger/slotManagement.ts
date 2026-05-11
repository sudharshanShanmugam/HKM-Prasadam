/**
 * @swagger
 * tags:
 *   name: Slot Management
 *   description: Slot calendar, rate editor, configured slots, and monthly booking summary
 */

/**
 * @swagger
 * /api/slot-management:
 *   get:
 *     summary: All slot dates for calendar view
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of slot dates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SlotDate' }
 */

/**
 * @swagger
 * /api/slot-management/configured:
 *   get:
 *     summary: Slots with custom price overrides, labels, or removed meals
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of configured slot dates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SlotDate' }
 */

/**
 * @swagger
 * /api/slot-management/monthly-summary:
 *   get:
 *     summary: Coupon counts per date per meal for a given month
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         schema: { type: string, example: '2025-08' }
 *         description: Month in YYYY-MM format (defaults to current month)
 *     responses:
 *       200:
 *         description: Map of date to meal counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 month:   { type: string }
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       Breakfast: { type: number }
 *                       Lunch:     { type: number }
 *                       Dinner:    { type: number }
 *                       total:     { type: number }
 *                       count:     { type: number }
 */

/**
 * @swagger
 * /api/slot-management/{date}:
 *   get:
 *     summary: Get a single slot with booking counts (rate editor data)
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: '2025-08-15' }
 *     responses:
 *       200:
 *         description: Slot config and booking breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     slot:          { $ref: '#/components/schemas/SlotDate' }
 *                     totalBookings: { type: number }
 *                     bookingCounts:
 *                       type: object
 *                       properties:
 *                         Thiruvanmiyur: { $ref: '#/components/schemas/Meals' }
 *                         NLBR:          { $ref: '#/components/schemas/Meals' }
 *   put:
 *     summary: Upsert full slot config for a date
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SlotDate' }
 *     responses:
 *       200:
 *         description: Upserted slot
 *   patch:
 *     summary: Partial update of a slot config
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SlotDate' }
 *     responses:
 *       200:
 *         description: Updated slot
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a slot date
 *     tags: [Slot Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
