import express, { NextFunction, Request, Response } from "express";
import { fitnessDataService } from "../6-services/fitness-data-service";

class FitnessDataController {
  public readonly router = express.Router();

  // Register routes once:
  public constructor() {
    this.registerRoutes();
  }

  // Register routes:
  private registerRoutes(): void {
    this.router.get("/fitness-data/:userId", this.getRecentFitnessData);
    this.router.get(
      "/fitness-data/date-range/:userId",
      this.getFitnessDataByDateRange
    );
    this.router.post("/fitness-data/", this.createFitnessData);
  }

  private async getRecentFitnessData(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = request.params;
      const weeklyFitnessData = await fitnessDataService.getRecentFitnessData(
        userId
      );
      response.json(weeklyFitnessData);
    } catch (err: any) {
      next(err);
    }
  }

  private async getFitnessDataByDateRange(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = request.params;
      const { startDate, endDate } = request.body;
      const weeklyFitnessDataByDateRange =
        await fitnessDataService.getFitnessDataByDateRange(
          userId,
          startDate,
          endDate
        );
      response.json(weeklyFitnessDataByDateRange);
    } catch (err: any) {
      next(err);
    }
  }

  private async createFitnessData(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {

        
    } catch (err: any) {
      next(err);
    }
  }
}

const fitnessDataController = new FitnessDataController();
export const fitnessDataRouter = fitnessDataController.router;
