/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Admin view of all prasadam coupon bookings
 */

/**
 * @swagger
 * /api/registrations:
 *   get:
 *     summary: List all registrations
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, mobile, or ID
 *       - in: query
 *         name: location
 *         schema: { type: string, enum: [Thiruvanmiyur, NLBR] }
 *       - in: query
 *         name: date
 *         schema: { type: string }
 *         description: Filter by date (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, declined] }
 *     responses:
 *       200:
 *         description: Array of bookings with meta counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PrasadamBooking' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     count:        { type: number }
 *                     totalCoupons: { type: number }
 */

/**
 * @swagger
 * /api/registrations/{id}:
 *   get:
 *     summary: Get a single registration by ID
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/PrasadamBooking' }
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a registration
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
