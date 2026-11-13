const express = require('express');
const cors = require('cors');
const { clientOrigin } = require('./config');
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

// Public API health check
app.get('/', (req, res) => {
    res.send('DORMIFY API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);

const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running at http://127.0.0.1:${server.address().port}`);
});
