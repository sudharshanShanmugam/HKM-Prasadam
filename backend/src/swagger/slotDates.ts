/**
 * @swagger
 * tags:
 *   name: Slot Dates
 *   description: Prasadam slot date availability (public + admin)
 *
 * /api/slot-dates:
 *   get:
 *     summary: Get active slot dates as a date→meals map (public, respects booking window rules)
 *     tags: [Slot Dates]
 *     security: []
 *     responses:
 *       200:
 *         description: Map of date to available meals (stopped/removed meals excluded)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items: { type: string, enum: [Breakfast, Lunch, Dinner] }
 *   post:
 *     summary: Create a new slot date (admin)
 *     tags: [Slot Dates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SlotDate' }
 *     responses:
 *       201:
 *         description: Slot date created
 *
 * /api/slot-dates/admin:
 *   get:
 *     summary: Get all slot dates with full details (admin)
 *     tags: [Slot Dates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of full slot date objects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SlotDate' }
 *
 * /api/slot-dates/{date}:
 *   get:
 *     summary: Get a single slot date by date string
 *     tags: [Slot Dates]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: '2025-08-15' }
 *     responses:
 *       200:
 *         description: Slot date details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/SlotDate' }
 *       404:
 *         description: Slot not found
 *   put:
 *     summary: Create or replace a slot date (admin, upsert)
 *     tags: [Slot Dates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: '2025-08-15' }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SlotDate' }
 *     responses:
 *       200:
 *         description: Upserted slot date
 *   patch:
 *     summary: Partially update a slot date (admin)
 *     tags: [Slot Dates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: '2025-08-15' }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stopped:    { type: boolean }
 *               isFestival: { type: boolean }
 *               mealStatus: { type: object }
 *     responses:
 *       200:
 *         description: Updated slot date
 *       404:
 *         description: Slot not found
 *   delete:
 *     summary: Delete a slot date (admin)
 *     tags: [Slot Dates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: '2025-08-15' }
 *     responses:
 *       200:
 *         description: Slot deleted
 */
