/**
 * @swagger
 * components:
 *   schemas:
 *     AdminUser:
 *       type: object
 *       properties:
 *         _id:       { type: string }
 *         name:      { type: string, example: Govinda Das }
 *         email:     { type: string, example: govinda@hkmchennai.org }
 *         role:
 *           type: string
 *           enum: [superadmin, admin, kitchen_manager, accounts_manager, gita_counter, prasadam_hall]
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/admin-users:
 *   get:
 *     summary: List all admin users
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of admin users (passwordHash excluded)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/AdminUser' }
 */

/**
 * @swagger
 * /api/admin-users:
 *   post:
 *     summary: Create a new admin user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: Govinda Das }
 *               email:    { type: string, example: govinda@hkmchennai.org }
 *               password: { type: string, minLength: 6, example: secret123 }
 *               role:
 *                 type: string
 *                 enum: [superadmin, admin, kitchen_manager, accounts_manager, gita_counter, prasadam_hall]
 *                 default: admin
 *     responses:
 *       201:
 *         description: Admin user created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/AdminUser' }
 *       400:
 *         description: Missing fields or password too short
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @swagger
 * /api/admin-users/{id}:
 *   put:
 *     summary: Update an admin user (name, role, or password)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId of the admin user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:     { type: string }
 *               role:
 *                 type: string
 *                 enum: [superadmin, admin, kitchen_manager, accounts_manager, gita_counter, prasadam_hall]
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Updated admin user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/AdminUser' }
 *       400:
 *         description: Password too short
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @swagger
 * /api/admin-users/{id}:
 *   delete:
 *     summary: Delete an admin user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId of the admin user
 *     responses:
 *       200:
 *         description: Admin user deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Admin user deleted }
 *       400:
 *         description: Cannot delete the only superadmin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
