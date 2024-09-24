import mongoose from "mongoose";
import {
  ResourceNotFoundError,
  ValidationError,
} from "../4-models/client-errors";
import {
  IDailyData,
  IWeeklyFitnessData,
  WeeklyFitnessData,
} from "../4-models/fitness-data";

class FitnessDataService {
  public async getRecentFitnessData(
    userId: string
  ): Promise<IWeeklyFitnessData | null> {
    const recentWeeklyData = await WeeklyFitnessData.findOne({
      userId,
    }).exec();

    if (!recentWeeklyData) throw new ResourceNotFoundError(userId);
    return recentWeeklyData;
  }

  public async getFitnessDataByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IWeeklyFitnessData[]> {
    const weeklyFitnessData = await WeeklyFitnessData.find({
      userId,
      weekStartDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).exec();

    if (!weeklyFitnessData || weeklyFitnessData.length === 0)
      throw new ResourceNotFoundError(userId);

    return weeklyFitnessData;
  }
  public async createWeeklyData(
    userId: string,
    weekStartDate: Date,
    dailyData: IDailyData
  ): Promise<IWeeklyFitnessData> {
    const newWeeklyData = new WeeklyFitnessData({
      userId,
      weekStartDate,
      dailyData,
    });

    const errors = newWeeklyData.validateSync();
    if (errors) throw new ValidationError(errors.message);

    const addedWeeklyData = await newWeeklyData.save();
    return addedWeeklyData;
  }

  public async calculateWeeklyData(
    weeklyFitnessId: string
  ): Promise<IWeeklyFitnessData> {
    const weeklyFitnessData = await WeeklyFitnessData.findOne({
      _id: weeklyFitnessId,
    }).exec();

    if (!weeklyFitnessData) throw new ResourceNotFoundError(weeklyFitnessId);
    const { dailyData } = weeklyFitnessData;

    const validDays = dailyData.filter((day) => day.weight > 0);

    const totalCalories = dailyData.reduce((sum, day) => sum + day.calories, 0);
    const totalProtein = dailyData.reduce((sum, day) => sum + day.protein, 0);
    const averageWeight = validDays.length
      ? validDays.reduce((sum, day) => sum + day.weight, 0) / validDays.length
      : 0;

    const totalSteps = dailyData.reduce((sum, day) => sum + day.steps, 0);
    weeklyFitnessData.totalCalories = totalCalories;
    weeklyFitnessData.totalProtein = totalProtein;
    weeklyFitnessData.averageWeight = averageWeight;
    weeklyFitnessData.totalSteps = totalSteps;

    await weeklyFitnessData.save();
    return weeklyFitnessData;
  }

  public async updateDailyData(
    weeklyFitnessId: string,
    dayId: string,
    fields: Partial<IDailyData>
  ): Promise<IDailyData | null> {
    const updatedDay = await WeeklyFitnessData.findOneAndUpdate(
      {
        _id: weeklyFitnessId,
        "dailyData._id": dayId,
      },
      {
        $set: {
          ...(fields.calories && { "dailyData.$.calories": fields.calories }),
          ...(fields.protein && { "dailyData.$.protein": fields.protein }),
          ...(fields.weight && { "dailyData.$.weight": fields.weight }),
          ...(fields.steps && { "dailyData.$.steps": fields.steps }),
        },
      },
      { new: true }
    ).exec();

    if (!updatedDay || !updatedDay.dailyData.length) {
      throw new ResourceNotFoundError(dayId);
    }

    const updatedDayData = updatedDay.dailyData.find(
      (data) => data._id.toString() === dayId
    );

    return updatedDayData || null;
  }
}

export const fitnessDataService = new FitnessDataService();
