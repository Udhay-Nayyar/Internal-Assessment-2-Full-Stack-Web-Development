require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

async function startServer() {
  await connectDB();

  const port = Number(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
  });
}

module.exports = startServer;