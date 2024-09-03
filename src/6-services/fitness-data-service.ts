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
    })
      .sort({ weekStartDate: -1 })
      .exec();

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

  public async updateWeeklyData(
    weekStartDate: Date,
    userId: string,
    dailyData: IDailyData[]
  ): Promise<IWeeklyFitnessData | null> {
    const totalCalories = dailyData.reduce((sum, day) => sum + day.calories, 0);
    const totalProtein = dailyData.reduce((sum, day) => sum + day.protein, 0);
    const averageWeight =
      dailyData.reduce((sum, day) => sum + day.weight, 0) / dailyData.length;
    const totalSteps = dailyData.reduce((sum, day) => sum + day.steps, 0);

    const updatedData = await WeeklyFitnessData.findOneAndUpdate(
      { userId, weekStartDate },
      {
        dailyData,
        totalCalories,
        totalProtein,
        averageWeight,
        totalSteps,
      },
      { new: true }
    );

    if (!updatedData) {
      throw new Error("Weekly data not found or update failed.");
    }

    return updatedData;
  }
}

export const fitnessDataService = new FitnessDataService();
