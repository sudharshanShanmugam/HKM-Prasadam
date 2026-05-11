/**
 * @swagger
 * tags:
 *   name: Internal Orders
 *   description: Internal prasadam orders by department
 *
 * /api/internal-orders:
 *   get:
 *     summary: List internal orders
 *     tags: [Internal Orders]
 *     parameters:
 *       - in: query
 *         name: mobile
 *         schema: { type: string }
 *       - in: query
 *         name: dept
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         schema: { type: string }
 *       - in: query
 *         name: accepted
 *         schema: { type: boolean }
 *       - in: query
 *         name: delivered
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Array of internal orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/InternalOrder' }
 *   post:
 *     summary: Submit a new internal order
 *     tags: [Internal Orders]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InternalOrder' }
 *     responses:
 *       201:
 *         description: Created order
 *
 * /api/internal-orders/{id}:
 *   get:
 *     summary: Get a single internal order by ID
 *     tags: [Internal Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Internal order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/InternalOrder' }
 *       404:
 *         description: Order not found
 *   delete:
 *     summary: Delete an internal order (admin)
 *     tags: [Internal Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order deleted
 *
 * /api/internal-orders/{id}/accept:
 *   patch:
 *     summary: Toggle accept status for an order (admin)
 *     tags: [Internal Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated order
 *
 * /api/internal-orders/{id}/deliver:
 *   patch:
 *     summary: Toggle delivered status for an order (admin)
 *     tags: [Internal Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated order
 */
