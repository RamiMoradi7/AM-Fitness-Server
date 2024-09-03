import express, { NextFunction, Request, Response } from "express";
import { StatusCode } from "../4-models/enums";
import { TrainingPlan } from "../4-models/training-plan";
import { trainingPlansService } from "../6-services/training-plans-service";

class TrainingPlansController {
  public readonly router = express.Router();

  // Register routes once:
  public constructor() {
    this.registerRoutes();
  }

  // Register routes:
  private registerRoutes(): void {
    this.router.get("/training-plans/:_id", this.getTrainingPlan);
    this.router.get("/training-plans/", this.getTrainingPlans);
    this.router.post("/training-plans/", this.addTrainingPlan);
    this.router.put("/training-plans/:_id", this.editTrainingPlan);
    this.router.delete("/training-plans/:_id", this.deleteTrainingPlan);
  }

  private async getTrainingPlan(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.params;
      const trainingPlan = await trainingPlansService.getTrainingPlan(_id);
      response.json(trainingPlan);
    } catch (err: any) {
      next(err);
    }
  }

  private async getTrainingPlans(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainingPlans = await trainingPlansService.getTrainingPlans();
      response.json(trainingPlans);
    } catch (err: any) {
      next(err);
    }
  }

  private async addTrainingPlan(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainingPlan = new TrainingPlan(request.body);
      const savedTrainingPlan = await trainingPlansService.addTrainingPlan(
        trainingPlan
      );
      response.status(StatusCode.Created).json(savedTrainingPlan);
    } catch (err: any) {
      next(err);
    }
  }

  private async editTrainingPlan(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.params;
      const updatedFields = request.body;
      const updatedTrainingPlan = await trainingPlansService.editTrainingPlan(
        _id,
        updatedFields
      );
      response.status(StatusCode.OK).json(updatedTrainingPlan);
    } catch (err: any) {
      next(err);
    }
  }

  private async deleteTrainingPlan(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.params;
      await trainingPlansService.deleteTrainingPlan(_id);
      response.sendStatus(StatusCode.NoContent);
    } catch (err: any) {
      next(err);
    }
  }
}

const trainingPlansController = new TrainingPlansController();
export const trainingPlansRouter = trainingPlansController.router;
