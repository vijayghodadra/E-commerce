try {
  console.log("Loading backend...");
  require('./server.js');
  console.log("Backend loaded successfully!");
} catch (e) {
  console.error("FAILED TO LOAD BACKEND:", e.stack);
}
