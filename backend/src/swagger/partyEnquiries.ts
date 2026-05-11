/**
 * @swagger
 * tags:
 *   name: Party Enquiries
 *   description: Door-delivery party prasadam enquiries
 *
 * /api/party-enquiries:
 *   get:
 *     summary: List party enquiries
 *     tags: [Party Enquiries]
 *     parameters:
 *       - in: query
 *         name: mobile
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, accepted, declined] }
 *     responses:
 *       200:
 *         description: Array of enquiries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PartyEnquiry' }
 *   post:
 *     summary: Submit a new party enquiry (public)
 *     tags: [Party Enquiries]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartyEnquiry' }
 *     responses:
 *       201:
 *         description: Created enquiry
 *
 * /api/party-enquiries/{id}:
 *   get:
 *     summary: Get a single party enquiry by ID
 *     tags: [Party Enquiries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: 'ENQ-12345' }
 *     responses:
 *       200:
 *         description: Enquiry details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/PartyEnquiry' }
 *       404:
 *         description: Enquiry not found
 *   patch:
 *     summary: Update enquiry status, payment, or confirmed quote (admin)
 *     tags: [Party Enquiries]
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
 *               status:         { type: string, enum: [pending, accepted, declined] }
 *               paid:           { type: boolean }
 *               confirmedMenu:  { type: string }
 *               confirmedPrice: { type: number }
 *     responses:
 *       200:
 *         description: Updated enquiry
 *   delete:
 *     summary: Delete an enquiry (admin)
 *     tags: [Party Enquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
