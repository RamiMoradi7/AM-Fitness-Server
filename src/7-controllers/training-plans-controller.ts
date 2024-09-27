import express, { NextFunction, Request, Response } from "express";
import { StatusCode } from "../4-models/enums";
import { ITrainingPlan, TrainingPlan } from "../4-models/training-plan";
import { ISet, IWeek } from "../4-models/week";
import { trainingPlansService } from "../6-services/training-plans-service";
import { securityMiddleware } from "../5-middleware/security-middleware";

class TrainingPlansController {
  public readonly router = express.Router();

  // Register routes once:
  public constructor() {
    this.registerRoutes();
  }

  // Register routes:
  private registerRoutes(): void {
    this.router.get("/training-plans/:_id", this.getTrainingPlan);
    this.router.get("/training-plans/week/:weekId", this.getPlanWeek);
    this.router.post(
      "/training-plans/date-range",
      securityMiddleware.verifyLoggedIn,
      this.getPlanByDateRange
    );
    this.router.get(
      "/training-plans/current/user/:_id",
      securityMiddleware.verifyLoggedIn,
      this.getCurrentWeeklyData
    );
    this.router.post(
      "/training-plans/",
      securityMiddleware.verifyAdmin,
      this.addTrainingPlan
    );
    this.router.put(
      "/training-plans/:_id",
      securityMiddleware.verifyAdmin,
      this.editTrainingPlan
    );
    this.router.put(
      "/week/:weekId/set-details/:_id",
      securityMiddleware.verifyLoggedIn,
      this.editSetDetails
    );
    this.router.put(
      "/training-plans/week/:weekId/",
      securityMiddleware.verifyLoggedIn,
      this.editPlanWeek
    );
    this.router.delete(
      "/training-plans/:_id",
      securityMiddleware.verifyAdmin,
      this.deleteTrainingPlan
    );
  }

  private async getTrainingPlan(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.params;
      const page = parseInt(request.query.page as string) || 1;
      const limit = parseInt(request.query.limit as string) || 1;

      const trainingPlan = await trainingPlansService.getTrainingPlan(
        _id,
        page,
        limit
      );
      response.json(trainingPlan);
    } catch (err: any) {
      next(err);
    }
  }

  private async getPlanWeek(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { weekId } = request.params;
      const week = await trainingPlansService.getPlanWeek(weekId);
      response.json(week);
    } catch (err: any) {
      next(err);
    }
  }

  private async getPlanByDateRange(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate, userId } = request.body.data;

      const week = await trainingPlansService.getPlanWeekByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
      response.json(week);
    } catch (err: any) {
      next(err);
    }
  }

  private async getCurrentWeeklyData(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.params;

      const week = await trainingPlansService.getCurrentWeeklyData(_id);
      response.json(week);
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
      const { days } = request.body;
      const savedTrainingPlan = await trainingPlansService.addTrainingPlan(
        trainingPlan,
        days
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
      const updatedFields = request.body as Partial<ITrainingPlan>;
      const updatedTrainingPlan = await trainingPlansService.editTrainingPlan(
        _id,
        updatedFields
      );
      response.status(StatusCode.OK).json(updatedTrainingPlan);
    } catch (err: any) {
      next(err);
    }
  }

  private async editSetDetails(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { weekId, _id: exerciseId } = request.params;
      const setDetailsFields = request.body as ISet;
      const updatedSetDetails =
        await trainingPlansService.updateExerciseSetDetails(
          weekId,
          exerciseId,
          setDetailsFields
        );
      response.status(StatusCode.OK).json(updatedSetDetails);
    } catch (err: any) {
      next(err);
    }
  }

  private async editPlanWeek(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { weekId } = request.params;
      const week = request.body as IWeek;
      const updatedWeek = await trainingPlansService.editPlanWeek(weekId, week);
      response.status(StatusCode.OK).json(updatedWeek);
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
