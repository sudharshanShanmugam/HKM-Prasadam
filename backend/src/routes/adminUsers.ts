import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import AdminUser from '../models/AdminUser';

type IRole = 'superadmin' | 'admin' | 'kitchen_manager' | 'accounts_manager' | 'gita_counter' | 'prasadam_hall';
const VALID_ROLES: string[] = ['superadmin', 'admin', 'kitchen_manager', 'accounts_manager', 'gita_counter', 'prasadam_hall'];

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const users = await AdminUser.find({}, { passwordHash: 0 }).sort({ createdAt: 1 });
  res.json({ success: true, data: users });
});

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
