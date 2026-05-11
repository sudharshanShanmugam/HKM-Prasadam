/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment approval and decline management
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: List all bookings for payment management
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, declined] }
 *       - in: query
 *         name: location
 *         schema: { type: string, enum: [Thiruvanmiyur, NLBR] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Bookings list with payment summary counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PrasadamBooking' }
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:    { type: number }
 *                     pending:  { type: number }
 *                     approved: { type: number }
 *                     declined: { type: number }
 */

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get a single booking
 *     tags: [Payments]
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
 */

/**
 * @swagger
 * /api/payments/{id}/approve:
 *   patch:
 *     summary: Approve a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated booking with status approved
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /api/payments/{id}/decline:
 *   patch:
 *     summary: Decline a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated booking with status declined
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /api/payments/{id}/status:
 *   patch:
 *     summary: Set payment status (generic)
 *     tags: [Payments]
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
 *               status:
 *                 type: string
 *                 enum: [pending, approved, declined]
 *     responses:
 *       200:
 *         description: Updated booking
 */

/**
 * @swagger
 * /api/payments/{id}/mismatch:
 *   patch:
 *     summary: Flag a payment as mismatched (declines with a note)
 *     tags: [Payments]
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
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Booking declined with mismatch note
 */
