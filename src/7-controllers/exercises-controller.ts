import express, { NextFunction, Request, Response } from "express";
import { StatusCode } from "../4-models/enums";
import { Exercise } from "../4-models/exercise";
import { exercisesService } from "../6-services/exercises-service";

class ExercisesController {
  public readonly router = express.Router();

  // Register routes once:
  public constructor() {
    this.registerRoutes();
  }

  // Register routes:
  private registerRoutes(): void {
    this.router.get("/exercises/", this.getExercises);
    this.router.get("/exercises/:_id", this.getExercise);
    this.router.post("/exercises/", this.addExercise);
    this.router.put("/exercises/:_id", this.updateExercise);
    this.router.get("/exercises/category/:name", this.getExercisesByCategory);
  }

  private async addExercise(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const exercise = new Exercise(request.body);
      const savedExercise = await exercisesService.addExercise(exercise);
      response.status(StatusCode.Created).json(savedExercise);
    } catch (err: any) {
      next(err);
    }
  }

  private async updateExercise(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.params;
      const fields = request.body;
      const updatedExercise = await exercisesService.updateExercise(
        _id,
        fields
      );
      response.status(StatusCode.OK).json(updatedExercise);
    } catch (err: any) {
      next(err);
    }
  }
  private async getExercise(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.params;
      const exercise = await exercisesService.getExercise(_id);
      response.json(exercise);
    } catch (err: any) {
      next(err);
    }
  }

  private async getExercises(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const exercises = await exercisesService.getExercises();
      response.json(exercises);
    } catch (err: any) {
      next(err);
    }
  }

  private async getExercisesByCategory(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name: categoryName } = request.params;
      const exercises = await exercisesService.getExercisesByCategory(
        categoryName
      );
      response.json(exercises);
    } catch (err: any) {
      next(err);
    }
  }
}

const exercisesController = new ExercisesController();
export const exercisesRouter = exercisesController.router;
