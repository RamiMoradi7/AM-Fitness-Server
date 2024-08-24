import cors from "cors";
import express from "express";
import expressFileUpload from "express-fileupload";
import path from "path";
import { fileSaver } from "uploaded-file-saver";
import { appConfig } from "./2-utils/app-config";
import { dal } from "./2-utils/dal";
import rateLimiter from "./3-config/rateLimiter";
import { errorsMiddleware } from "./5-middleware/errors-middleware";
import { loggerMiddleware } from "./5-middleware/logger-middleware";
import { authRouter } from "./7-controllers/auth-controller";
import { contactRouter } from "./7-controllers/contact-controller";
import { usersRouter } from "./7-controllers/users-controller";

// Create Express application
const app = express();

// CORS configuration
const corsOptions = {
  origin: "https://am-fitness.onrender.com", // Your frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
// app.use(cookieParser());
// app.use(csrfProtection); // Apply CSRF protection
// app.use(setCsrfTokenHeader); // Add CSRF token to headers
// app.use(helmet()); // Adds security-related headers
app.use(rateLimiter); // Apply rate limiting
app.use(expressFileUpload()); // File upload middleware
app.use(loggerMiddleware.logToConsole);

// Configure fileSaver
fileSaver.config(path.join(__dirname, "1-assets", "images"));

// Route setup
app.use("/api", usersRouter, contactRouter, authRouter);

// Error handling middlewares
app.use(errorsMiddleware.routeNotFound);
app.use(errorsMiddleware.catchAll);

// Connect to database and start server
const start = async () => {
  await dal.connect();
  app.listen(appConfig.port, () => {
    console.log(`Listening on http://localhost:${appConfig.port}`);
  });
};

// Start the server
start();
