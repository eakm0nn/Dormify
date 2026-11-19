const express = require('express');
const cors = require('cors');
const { clientOrigin } = require('./config');
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const operationsRoutes = require('./routes/operationsRoutes');
const billingRoutes = require('./routes/billingRoutes');
const communityRoutes = require('./routes/communityRoutes');
const { expireReservations } = require('./lib/reservations');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

// Public API health check
app.get('/', (req, res) => {
    res.send('DORMIFY API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', require('./routes/roomMediaRoutes'));
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/operations', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/api/operations', operationsRoutes);
app.use('/api/operations', billingRoutes);
app.use('/api/operations', communityRoutes);
app.use('/api/operations', require('./routes/historyRoutes'));
app.use('/api/operations', require('./routes/meterRoutes'));
app.use('/api/operations', require('./routes/closeoutRoutes'));
app.use('/api/operations', require('./routes/leaseRevisionRoutes'));
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = [400, 413, 415].includes(error.status) ? error.status : 500;
    res.status(status).json({ error: status === 413 ? 'ไฟล์หรือข้อมูลใหญ่เกินกำหนด' : status === 500 ? 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่' : 'รูปแบบข้อมูลไม่ถูกต้อง' });
});

const expiryWorker = setInterval(() => expireReservations().catch(() => console.error('Reservation expiry check failed; check local database availability.')), 60000);
expiryWorker.unref();
const billingWorker = setInterval(() => require('./lib/auto-billing').tickBilling().catch(() => console.error('Automatic billing check failed.')), 60000);
billingWorker.unref();

const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running at http://127.0.0.1:${server.address().port}`);
});
