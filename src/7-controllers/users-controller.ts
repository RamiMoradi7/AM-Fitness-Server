import express, { NextFunction, Request, Response } from "express";
import { usersService } from "../6-services/users-service";
import { UploadedFile } from "express-fileupload";
import { StatusCode } from "../4-models/enums";

class UsersController {
  public readonly router = express.Router();

  // Register routes once:
  public constructor() {
    this.registerRoutes();
  }

  // Register routes:
  private registerRoutes(): void {
    this.router.get("/csrf-token", this.getCsrfToken);
    this.router.get("/users", this.getUsers);
    this.router.get("/users/:_id", this.getUser);
    this.router.put("/users/:_id", this.updateUser);
    this.router.delete("/users/:_id", this.deleteUser);
    this.router.post("/fetch-metadata");
  }
  // Get CSRF Token
  private async getCsrfToken(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      response.json({ csrfToken: request.csrfToken() });
    } catch (err: any) {
      next(err);
    }
  }
  private async getUsers(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await usersService.getUsers();
      response.json(users);
    } catch (err: any) {
      next(err);
    }
  }
  private async getUser(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = request.params._id;
      const user = await usersService.getUser(userId);
      response.json(user);
    } catch (err: any) {
      next(err);
    }
  }
  private async updateUser(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = request.params._id;
      const { fields } = request.body;
      const image = (request.files.image as UploadedFile) || null;
      const updatedUser = await usersService.updateUser({
        userId,
        fields,
        image,
      });
      response.json(updatedUser);
    } catch (err: any) {
      next(err);
    }
  }
  private async deleteUser(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = request.params._id;
      await usersService.deleteUser(userId);
      response.sendStatus(StatusCode.NoContent);
    } catch (err: any) {
      next(err);
    }
  }
}

const usersController = new UsersController();
export const usersRouter = usersController.router;
