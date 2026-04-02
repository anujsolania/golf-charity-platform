require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedData = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  if (process.env.NODE_ENV === 'development') await seedData();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();
