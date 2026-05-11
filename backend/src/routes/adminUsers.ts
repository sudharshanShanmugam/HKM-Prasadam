import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import AdminUser from '../models/AdminUser';

type IRole = 'superadmin' | 'admin' | 'kitchen_manager' | 'accounts_manager' | 'gita_counter' | 'prasadam_hall';
const VALID_ROLES: string[] = ['superadmin', 'admin', 'kitchen_manager', 'accounts_manager', 'gita_counter', 'prasadam_hall'];

const router = Router();

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
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const users = await AdminUser.find({}, { passwordHash: 0 }).sort({ createdAt: 1 });
  res.json({ success: true, data: users });
});

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
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body as {
    name?: string; email?: string; password?: string; role?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'name, email, and password are required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    return;
  }

  const existing = await AdminUser.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({ success: false, message: 'An admin with this email already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await AdminUser.create({
    name, email, passwordHash,
    role: (VALID_ROLES.includes(role ?? '') ? role : 'admin') as IRole,
  });

  res.status(201).json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
  });
});

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
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { name, role, password } = req.body as {
    name?: string; role?: string; password?: string;
  };

  const user = await AdminUser.findById(req.params.id);
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

  if (name)  user.name = name;
  if (role && VALID_ROLES.includes(role)) user.role = role as IRole;
  if (password) {
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }
    user.passwordHash = await bcrypt.hash(password, 12);
  }
  await user.save();

  res.json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

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
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const user = await AdminUser.findById(req.params.id);
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

  // Prevent deleting the last superadmin
  if (user.role === 'superadmin') {
    const superAdminCount = await AdminUser.countDocuments({ role: 'superadmin' });
    if (superAdminCount <= 1) {
      res.status(400).json({ success: false, message: 'Cannot delete the only superadmin' });
      return;
    }
  }

  await user.deleteOne();
  res.json({ success: true, message: 'Admin user deleted' });
});

export default router;
