/**
 * @swagger
 * tags:
 *   name: Prasadam Bookings
 *   description: Public prasadam coupon bookings
 *
 * /api/prasadam-bookings:
 *   get:
 *     summary: List bookings (filterable by mobile, date, status)
 *     tags: [Prasadam Bookings]
 *     parameters:
 *       - in: query
 *         name: mobile
 *         schema: { type: string }
 *         description: Filter by mobile number
 *       - in: query
 *         name: date
 *         schema: { type: string, example: '2025-08-15' }
 *         description: Filter by booking date
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, declined] }
 *     responses:
 *       200:
 *         description: Array of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PrasadamBooking' }
 *   post:
 *     summary: Submit a new prasadam booking (public)
 *     tags: [Prasadam Bookings]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PrasadamBooking' }
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error
 *
 * /api/prasadam-bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Prasadam Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: 'HKM-12345' }
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/PrasadamBooking' }
 *       404:
 *         description: Booking not found
 *   delete:
 *     summary: Delete a booking (admin)
 *     tags: [Prasadam Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking deleted
 *
 * /api/prasadam-bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (admin)
 *     tags: [Prasadam Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, approved, declined] }
 *     responses:
 *       200:
 *         description: Updated booking
 *       404:
 *         description: Booking not found
 */
