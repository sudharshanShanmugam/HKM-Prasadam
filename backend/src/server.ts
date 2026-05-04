import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import errorHandler from './middleware/errorHandler';
import { requireAuth } from './middleware/requireAuth';

import authRouter             from './routes/auth';
import prasadamBookingsRouter from './routes/prasadamBookings';
import partyEnquiriesRouter   from './routes/partyEnquiries';
import internalOrdersRouter   from './routes/internalOrders';
import slotDatesRouter        from './routes/slotDates';
import mealMenusRouter        from './routes/mealMenus';
import festivalsRouter        from './routes/festivals';

const app = express();

connectDB();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api/auth',              authRouter);
app.use('/api/prasadam-bookings', prasadamBookingsRouter);
app.use('/api/party-enquiries',   partyEnquiriesRouter);
app.use('/api/internal-orders',   internalOrdersRouter);
app.use('/api/slot-dates',        slotDatesRouter);
app.use('/api/meal-menus',        mealMenusRouter);
app.use('/api/festivals',         festivalsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
