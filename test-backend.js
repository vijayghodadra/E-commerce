const path = require('path');
// Load backend .env
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

try {
  console.log("Loading backend...");
  require('./backend/server.js');
  console.log("Backend loaded successfully!");
} catch (e) {
  console.error("FAILED TO LOAD BACKEND:", e.stack);
}
