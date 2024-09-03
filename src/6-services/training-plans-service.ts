import mongoose from "mongoose";
import {
  ResourceNotFoundError,
  ValidationError,
} from "../4-models/client-errors";
import { ITrainingPlan, TrainingPlan } from "../4-models/training-plan";
import { User } from "../4-models/user";

class TrainingPlansService {
  public async getTrainingPlan(_id: string): Promise<ITrainingPlan> {
    const trainingPlan = await TrainingPlan.findById({ _id })
      .populate(["user", "days.exercises"])
      .exec();
    if (!trainingPlan) throw new ResourceNotFoundError(_id);
    return trainingPlan;
  }

  public async getTrainingPlans(): Promise<ITrainingPlan[]> {
    const trainingPlans = await TrainingPlan.find()
      .populate(["user", "days.exercises"])
      .exec();
    if (!trainingPlans) throw new ValidationError("No Training Plans Found.");
    return trainingPlans;
  }

  public async addTrainingPlan(
    trainingPlan: ITrainingPlan
  ): Promise<ITrainingPlan> {
    const errors = trainingPlan.validateSync();
    if (errors) throw new ValidationError(errors.message);

    const userId = trainingPlan.user;

    const user = await User.findById(userId).exec();
    if (!user) throw new ResourceNotFoundError(userId.toString());

    const savedTrainingPlan = await trainingPlan.save();
    await User.findByIdAndUpdate(
      trainingPlan.user,
      {
        $push: { trainingPlans: savedTrainingPlan },
      },
      { new: true }
    );

    return savedTrainingPlan;
  }

  public async editTrainingPlan(
    trainingPlanId: string,
    fields: Partial<ITrainingPlan>
  ): Promise<ITrainingPlan> {
    if (!mongoose.Types.ObjectId.isValid(trainingPlanId)) {
      throw new ValidationError("Invalid training plan ID.");
    }

    const trainingPlan = await TrainingPlan.findById(trainingPlanId).exec();
    if (!trainingPlan) throw new ResourceNotFoundError(trainingPlanId);

    Object.assign(trainingPlan, fields);

    const errors = trainingPlan.validateSync();
    if (errors) throw new ValidationError(errors.message);
    const updatedTrainingPlan = await trainingPlan.save();

    const user = await User.findById(updatedTrainingPlan.user).exec();
    if (!user)
      throw new ResourceNotFoundError(updatedTrainingPlan.user.toString());

    await User.bulkWrite([
      {
        updateOne: {
          filter: { _id: updatedTrainingPlan.user },
          update: { $pull: { trainingPlans: trainingPlanId } },
        },
      },
      {
        updateOne: {
          filter: { _id: updatedTrainingPlan.user },
          update: { $push: { trainingPlans: updatedTrainingPlan._id } },
        },
      },
    ]);

    return updatedTrainingPlan;
  }

  public async deleteTrainingPlan(trainingPlanId: string): Promise<void> {
    const planToDelete = await TrainingPlan.findByIdAndDelete(trainingPlanId);
    if (!planToDelete) throw new ResourceNotFoundError(trainingPlanId);
  }
}

export const trainingPlansService = new TrainingPlansService();
