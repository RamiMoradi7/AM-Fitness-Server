import express, { NextFunction, Request, Response } from "express";
import { fitnessDataService } from "../6-services/fitness-data-service";
import { IDailyData } from "../4-models/fitness-data";
import { StatusCode } from "../4-models/enums";

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
    this.router.get(
      "/fitness-data/:_id/total",
      this.calculateWeeklyFitnessTotal
    );
    this.router.put("/fitness-data/:_id/day/:dayId", this.editDailyFitnessData);
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

  private async editDailyFitnessData(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id: weeklyFitnessId, dayId } = request.params;
      const fields = request.body as Partial<IDailyData>;
      const updatedDailyData = await fitnessDataService.updateDailyData(
        weeklyFitnessId,
        dayId,
        fields
      );
      console.log(updatedDailyData);

      response.status(StatusCode.OK).json(updatedDailyData);
    } catch (err: any) {
      next(err);
    }
  }

  private async calculateWeeklyFitnessTotal(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id: weeklyFitnessId } = request.params;
      const updatedFitnessData = await fitnessDataService.calculateWeeklyData(
        weeklyFitnessId
      );
      response.status(StatusCode.OK).json(updatedFitnessData);
    } catch (err: any) {
      next(err);
    }
  }
}

const fitnessDataController = new FitnessDataController();
export const fitnessDataRouter = fitnessDataController.router;
