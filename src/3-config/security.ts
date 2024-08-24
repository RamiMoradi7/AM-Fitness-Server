import helmet from "helmet";
import csurf from "csurf";
import { NextFunction, Request, Response, RequestHandler } from "express";

// Initialize CSRF protection with cookie options
export const csrfProtection: RequestHandler = csurf({
  cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production" },
});

export const securityMiddleware: RequestHandler[] = [helmet(), csrfProtection];

// Middleware to set CSRF token in response headers

export const setCsrfTokenHeader = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.csrfToken) {
    res.setHeader("X-CSRF-Token", req.csrfToken());
  }
  next();
};
