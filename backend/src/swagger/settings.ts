/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Default meal rates, slot limits, and booking window configuration
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get default settings (creates with defaults if none exist)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Settings' }
 *   put:
 *     summary: Update all settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Settings' }
 *     responses:
 *       200:
 *         description: Updated settings
 */

/**
 * @swagger
 * /api/settings/meal-rates:
 *   patch:
 *     summary: Update default meal rates only
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Meals' }
 *     responses:
 *       200:
 *         description: Updated settings
 */

/**
 * @swagger
 * /api/settings/slot-limits:
 *   patch:
 *     summary: Update default slot limits per location
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Thiruvanmiyur: { $ref: '#/components/schemas/Meals' }
 *               NLBR:          { $ref: '#/components/schemas/Meals' }
 *     responses:
 *       200:
 *         description: Updated settings
 */

/**
 * @swagger
 * /api/settings/booking-window:
 *   patch:
 *     summary: Update booking window auto-open / auto-close config
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingWindowOpen:  { type: boolean }
 *               bookingWindowClose: { type: boolean }
 *               bookingOpenDays:    { type: number }
 *               bookingCloseDays:   { type: number }
 *     responses:
 *       200:
 *         description: Updated settings
 */
