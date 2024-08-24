import express, { NextFunction, Request, Response } from "express";
import { User } from "../4-models/user";
import { authService } from "../6-services/auth-service";
import { StatusCode } from "../4-models/enums";
import { Credentials } from "../4-models/credentials";

class AuthController {
  public readonly router = express.Router();

  public constructor() {
    this.registerRoutes();
  }
  private registerRoutes(): void {
    this.router.post("/register", this.register);
    this.router.post("/login", this.login);
    this.router.post("/password-reset-request", this.passwordResetRequest);
    this.router.post("/validate-reset-token", this.validatePasswordResetToken);
    this.router.post("/change-password", this.handleChangePassword);
  }

  private async register(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = new User(request.body);
      const token = await authService.register(user);
      response.status(StatusCode.Created).json(token);
    } catch (err: any) {
      next(err);
    }
  }

  private async login(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const credentials = new Credentials(request.body);
      const token = await authService.login(credentials);
      response.json(token);
    } catch (err: any) {
      next(err);
    }
  }

  private async passwordResetRequest(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = request.body;
      await authService.passwordResetRequest(email);
      response.json({ message: "Token is valid." });
    } catch (err: any) {
      next(err);
    }
  }
  private async validatePasswordResetToken(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = request.body;
      console.log(token);
      await authService.validatePasswordResetToken(token);
      response.json({ message: "Verify Your Email." });
    } catch (err: any) {
      next(err);
    }
  }
  private async handleChangePassword(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, newPassword } = request.body;
      const newToken = await authService.changeUserPassword(token, newPassword);
      response.json(newToken);
    } catch (err: any) {
      next(err);
    }
  }
}

const authController = new AuthController();
export const authRouter = authController.router;
