import app from './app.js';
import { config } from './config/index.js';
import { startExpiryWorker } from './workers/expiryWorker.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 BazarPool Backend Server listening on port ${PORT}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`====================================================`);

  // Start background cron jobs
  startExpiryWorker();
});
