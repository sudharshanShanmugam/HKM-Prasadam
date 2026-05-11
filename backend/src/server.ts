import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db';
import errorHandler from './middleware/errorHandler';
import { requireAuth } from './middleware/requireAuth';
import swaggerSpec from './config/swagger';

import authRouter             from './routes/auth';
import adminUsersRouter       from './routes/adminUsers';
import prasadamBookingsRouter from './routes/prasadamBookings';
import partyEnquiriesRouter   from './routes/partyEnquiries';
import internalOrdersRouter   from './routes/internalOrders';
import slotDatesRouter        from './routes/slotDates';
import mealMenusRouter        from './routes/mealMenus';
import festivalsRouter        from './routes/festivals';

// ─── Purpose-specific admin routes ───────────────────────────────────────────
import dashboardRouter       from './routes/dashboard';
import registrationsRouter   from './routes/registrations';
import paymentsRouter        from './routes/payments';
import settingsRouter        from './routes/settings';
import slotManagementRouter  from './routes/slotManagement';

const app = express();

// ─── Seed initial superadmin from env if no admin users exist ─────────────────
async function seedInitialAdmin() {
  const { default: AdminUser } = await import('./models/AdminUser');
  const bcrypt = await import('bcryptjs');
  const count = await AdminUser.countDocuments();
  if (count === 0) {
    const email = process.env.ADMIN_EMAIL;
    const hash  = process.env.ADMIN_PASSWORD_HASH;
    if (email && hash) {
      await AdminUser.create({ name: 'Super Admin', email, passwordHash: hash, role: 'superadmin' });
      console.log(`✅ Seeded initial superadmin: ${email}`);
    } else {
      console.warn('⚠️  No ADMIN_EMAIL/ADMIN_PASSWORD_HASH in .env — no admin user created');
    }
  }
}

connectDB().then(seedInitialAdmin);

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '15mb' }));

// ─── Legacy / public routes ───────────────────────────────────────────────────
app.use('/api/auth',              authRouter);
app.use('/api/admin-users',       requireAuth, adminUsersRouter);
app.use('/api/prasadam-bookings', prasadamBookingsRouter);
app.use('/api/party-enquiries',   partyEnquiriesRouter);
app.use('/api/internal-orders',   internalOrdersRouter);
app.use('/api/slot-dates',        slotDatesRouter);
app.use('/api/meal-menus',        mealMenusRouter);
app.use('/api/festivals',         festivalsRouter);

// ─── Purpose-specific admin routes ───────────────────────────────────────────
app.use('/api/dashboard',         dashboardRouter);
app.use('/api/registrations',     registrationsRouter);
app.use('/api/payments',          paymentsRouter);
app.use('/api/settings',          settingsRouter);
app.use('/api/slot-management',   slotManagementRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'HKM Prasadam API Docs',
  customCss: '.swagger-ui .topbar { background-color: #C44D0D; }',
}));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
