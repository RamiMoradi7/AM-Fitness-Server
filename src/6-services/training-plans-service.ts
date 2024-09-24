import mongoose, { Types } from "mongoose";
import { formatDate, getStartOfCurrentWeekday } from "../2-utils/date-utils";
import {
  ResourceNotFoundError,
  ValidationError,
} from "../4-models/client-errors";
import { WeeklyFitnessData } from "../4-models/fitness-data";
import { ITrainingPlan, TrainingPlan } from "../4-models/training-plan";
import { User } from "../4-models/user";
import { IDay, ISet, IWeek, Week } from "../4-models/week";

class TrainingPlansService {
  public async getTrainingPlan(
    _id: string,
    page: number = 1,
    limit: number = 4
  ): Promise<{
    trainingPlan: ITrainingPlan;
    weeks: IWeek[];
    totalWeeks: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const trainingPlan = await TrainingPlan.findOne({ _id })
      .populate({ path: "user", select: "_id firstName lastName" })
      .populate({
        path: "weeks",
        populate: {
          path: "days.exercises.exercise",
        },
        model: "Week",
        options: {
          skip,
          limit,
        },
      })
      .exec();

    if (!trainingPlan) throw new ResourceNotFoundError(_id);

    const totalWeeks = await Week.countDocuments({
      trainingPlan: { $in: trainingPlan._id },
    });

    const totalPages = Math.ceil(totalWeeks / limit);
    return {
      trainingPlan,
      weeks: trainingPlan.weeks as unknown as IWeek[],
      totalWeeks,
      currentPage: page,
      totalPages,
    };
  }

  public async getPlanWeek(weekId: string): Promise<IWeek> {
    const week = await Week.findOne({
      _id: weekId,
    })
      .populate({
        path: "days.exercises.exercise",
        select: "-setDetails",
      })

      .exec();

    if (!week) throw new ResourceNotFoundError(weekId);
    return week;
  }

  public async getPlanWeekByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IWeek> {
    const week = await Week.findOne({
      userId,
      startDate: {
        $lte: endDate,
      },
      endDate: {
        $gte: startDate,
      },
    })
      .populate("weeklyFitnessData")
      .populate({ path: "days.exercises.exercise" })

      .exec();

    if (!week)
      throw new ValidationError(
        `לא נמצאו נתונים לתאריכים בין ${formatDate(startDate)} - ${formatDate(
          endDate
        )}`
      );

    return week;
  }

  public async getCurrentWeeklyData(userId: string): Promise<IWeek> {
    const currentDate = new Date();
    const week = await Week.findOne({
      userId,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    })
      .populate("weeklyFitnessData")
      .populate({ path: "days.exercises.exercise" })
      .exec();

    if (!week)
      throw new ValidationError(
        `לא נמצאו נתונים לתאריך בין ${formatDate(currentDate)} 
     }`
      );

    return week;
  }

  public async addTrainingPlan(
    trainingPlanData: ITrainingPlan,
    days: IDay[]
  ): Promise<ITrainingPlan> {
    const { user: userId, durationInMonths } = trainingPlanData;
    const trainingPlan = new TrainingPlan(trainingPlanData);
    const errors = trainingPlan.validateSync();

    if (errors) throw new ValidationError(errors.message);
    const user = await User.findById(userId).exec();
    if (!user) throw new ResourceNotFoundError(userId.toString());

    const weeks = await this.generateWeeks(
      durationInMonths,
      days,
      userId.toString(),
      trainingPlan._id as Types.ObjectId
    );

    trainingPlan.weeks = weeks.map(
      (week) => new mongoose.Types.ObjectId(week._id)
    );
    const savedTrainingPlan = await trainingPlan.save();

    user.trainingPlans.push(
      savedTrainingPlan._id as mongoose.Schema.Types.ObjectId
    );
    await user.save();

    return savedTrainingPlan;
  }

  private async generateWeeks(
    durationInMonths: number,
    days: IDay[],
    userId: string,
    trainingPlanId: mongoose.Types.ObjectId
  ): Promise<IWeek[]> {
    const weeks: IWeek[] = [];
    const totalWeeks = durationInMonths * 4;
    const startDate = getStartOfCurrentWeekday();

    for (let weekNumber = 1; weekNumber <= totalWeeks; weekNumber++) {
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);

      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      const weekDays = days.map((day) => ({ ...day }));

      const weeklyFitnessData = new WeeklyFitnessData({
        userId,
        weekStartDate: weekStartDate,
        weekEndDate: weekEndDate,
        trainingPlanId,
        totalCalories: 0,
        totalProtein: 0,
        averageWeight: 0,
        totalSteps: 0,
      });

      await weeklyFitnessData.save();

      const week = new Week({
        weekNumber,
        userId,
        days: weekDays,
        trainingPlan: trainingPlanId,
        weeklyFitnessData: weeklyFitnessData._id,
        startDate: weekStartDate,
        endDate: weekEndDate,
      });

      await week.save();

      weeks.push(week);
    }
    return weeks;
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

    if (fields.durationInMonths) {
      const newDuration = fields.durationInMonths;
      const totalWeeks = newDuration * 4;

      if (trainingPlan.durationInMonths > fields.durationInMonths) {
        console.log("smaller");
      } else {
        console.log("bigger");
      }
    }

    Object.assign(trainingPlan, { ...fields });

    const errors = trainingPlan.validateSync();
    if (errors) throw new ValidationError(errors.message);

    const updatedTrainingPlan = await trainingPlan.save();
    const user = await User.findById(updatedTrainingPlan.user).exec();

    if (!user)
      throw new ResourceNotFoundError(updatedTrainingPlan.user.toString());

    await User.updateOne(
      { _id: updatedTrainingPlan.user, trainingPlans: trainingPlanId },
      { $set: { "trainingPlans.$": updatedTrainingPlan._id } }
    );

    return updatedTrainingPlan;
  }

  public async editPlanWeek(
    weekId: string,
    weekData: Partial<IWeek>
  ): Promise<IWeek> {
    const updatedWeek = await Week.findByIdAndUpdate(
      weekId,
      { ...weekData },
      { new: true }
    );

    if (!updatedWeek) throw new ResourceNotFoundError(weekId);
    const week = await this.getPlanWeek(weekId);

    return week;
  }

  public async deleteTrainingPlan(trainingPlanId: string): Promise<void> {
    const planToDelete = await TrainingPlan.findByIdAndDelete(trainingPlanId);

    if (!planToDelete) {
      throw new ResourceNotFoundError(trainingPlanId);
    }
    const weekIds = planToDelete.weeks;
    await User.findByIdAndUpdate(planToDelete.user, {
      $pull: { trainingPlans: trainingPlanId },
    });
    await Week.deleteMany({ _id: { $in: weekIds } });
    await WeeklyFitnessData.deleteMany({ trainingPlanId: planToDelete._id });

    console.log(
      `Training plan ${trainingPlanId} and its associated weeks deleted successfully.`
    );
  }

  public async updateExerciseSetDetails(
    weekId: string,
    exerciseId: string,
    setDetails: Partial<ISet>
  ): Promise<ISet> {
    const weekObjectId = new mongoose.Types.ObjectId(weekId);
    const exerciseObjectId = new mongoose.Types.ObjectId(exerciseId);
    const setObjectId = new mongoose.Types.ObjectId(setDetails._id.toString());

    const updateFields: Record<string, any> = {};
    Object.keys(setDetails).forEach((key) => {
      if (setDetails[key] !== undefined && setDetails[key] !== null) {
        updateFields[
          `days.$[day].exercises.$[exercise].setDetails.$[set].${key}`
        ] = setDetails[key];
      }
    });

    const updatedWeek = await Week.findOneAndUpdate(
      {
        _id: weekObjectId,
        "days.exercises._id": exerciseObjectId,
        "days.exercises.setDetails._id": setObjectId,
      },
      {
        $set: updateFields,
      },
      {
        runValidators: true,
        arrayFilters: [
          { "day.exercises._id": exerciseObjectId },
          { "exercise._id": exerciseObjectId },
          { "set._id": setObjectId },
        ],
        new: true,
      }
    ).exec();

    if (!updatedWeek) {
      throw new Error("Week not found.");
    }

    const updatedSet = updatedWeek.days
      .flatMap((day) => day.exercises)
      .flatMap((exercise) => exercise.setDetails)
      .find((set) => set._id?.toString() === setObjectId.toString());

    if (!updatedSet) {
      throw new Error("Updated set details not found.");
    }

    console.log("Exercise set details updated and retrieved successfully.");

    return updatedSet;
  }
}
export const trainingPlansService = new TrainingPlansService();
