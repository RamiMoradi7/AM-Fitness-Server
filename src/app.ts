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
import { exercisesRouter } from "./7-controllers/exercises-controller";
import { trainingPlansRouter } from "./7-controllers/training-plans-controller";
import { fitnessDataRouter } from "./7-controllers/fitness-data-controller";
import cookieParser from "cookie-parser";
import { csrfProtection, setCsrfTokenHeader } from "./3-config/security";
import helmet from "helmet";

// Create Express application
const app = express();

// CORS configuration
const corsOptions = {
  origin: ["https://am-fitness.onrender.com", "http://localhost:3000"],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.get("/api/AMFitness/customer-image/:imageName", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust as necessary
  try {
    const imageName = req.params.imageName;
    const imagePath = fileSaver.getFilePath(imageName);
    res.sendFile(imagePath);
  } catch (err: any) {
    console.log(err);
  }
});

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection); // Apply CSRF protection
app.use(setCsrfTokenHeader); // Add CSRF token to headers
app.use(helmet()); // Adds security-related headers
app.use(rateLimiter); // Apply rate limiting
app.use(expressFileUpload()); // File upload middleware
app.use(loggerMiddleware.logToConsole);

app.use((req, res, next) => {
  res.cookie("csrfToken", req.csrfToken(), {
    httpOnly: true,
    secure: true, // Ensure the cookie is sent only over HTTPS
    sameSite: "none",
  });
  next();
});
// Configure fileSaver
fileSaver.config(path.join(__dirname, "1-assets", "images"));

// Route setup
app.use(
  "/api",
  usersRouter,
  contactRouter,
  authRouter,
  exercisesRouter,
  trainingPlansRouter,
  fitnessDataRouter
);

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
