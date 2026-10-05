require("dotenv").config();
require("dotenv").config({ path: require("node:path").join(__dirname, ".env") });

const app = require("./app");
const connectDB = require("./config/db");

async function startServer() {
  await connectDB();

  const port = Number(process.env.PORT) || 3000;

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
  });
}

module.exports = startServer;