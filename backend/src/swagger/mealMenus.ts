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
