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
