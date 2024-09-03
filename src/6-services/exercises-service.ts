import {
  ResourceNotFoundError,
  ValidationError,
} from "../4-models/client-errors";
import { Exercise, IExercise } from "../4-models/exercise";

class ExercisesService {
  public async getExercise(exerciseId: string): Promise<IExercise> {
    const exercise = await Exercise.findById(exerciseId).exec();
    if (!exercise) throw new ResourceNotFoundError(exerciseId);
    return exercise;
  }

  public async getExercises(): Promise<IExercise[]> {
    const exercises = await Exercise.find().exec();
    if (!exercises) throw new ValidationError("No exercises found.");
    return exercises;
  }

  public async getExercisesByCategory(category: string): Promise<IExercise[]> {
    const exercises = await Exercise.find({ category }).exec();
    if (!exercises)
      throw new ValidationError(`לא נמצאו תרגילים בקטגוריה ${category}.`);
    return exercises;
  }

  public async addExercise(exercise: IExercise): Promise<IExercise> {
    const errors = exercise.validateSync();
    if (errors) throw new ValidationError(errors.message);
    const savedExercise = await exercise.save();
    return savedExercise;
  }
  public async updateExercise(
    exerciseId: string,
    fields: Partial<IExercise>
  ): Promise<IExercise> {
    const exercise = await this.getExercise(exerciseId);
    Object.assign(exercise, fields);
    const errors = exercise.validateSync();
    if (errors) throw new ValidationError(errors.message);

    const updatedExercise = await Exercise.findByIdAndUpdate(
      exerciseId,
      fields,
      { new: true }
    );
    console.log(updatedExercise);
    return updatedExercise;
  }
}

export const exercisesService = new ExercisesService();
