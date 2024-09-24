import mongoose, { Document, model, Schema } from "mongoose";

// Interface for Daily Data
export interface IDailyData extends Document {
  _id: mongoose.Types.ObjectId; // Add _id for identifying each day
  date: Date;
  calories: number;
  protein: number;
  weight: number;
  steps: number;
}

// Interface for Weekly Fitness Data
export interface IWeeklyFitnessData extends Document {
  userId: mongoose.Types.ObjectId;
  trainingPlanId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  weekEndDate: Date;
  dailyData: IDailyData[];
  totalCalories: number;
  totalProtein: number;
  averageWeight: number;
  totalSteps: number;
  createdAt: Date;
  updatedAt: Date;
}

export const DailyDataSchema = new Schema<IDailyData>({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  date: { type: Date, required: [true, "Date is missing."] },
  calories: { type: Number, required: [true, "Calories is missing."] },
  protein: { type: Number, required: [true, "Protein is missing."] },
  weight: { type: Number, required: [true, "Weight is missing."] },
  steps: { type: Number, required: [true, "Steps is missing."] },
});

const generateDefaultDailyData = (weekStartDate: Date): IDailyData[] => {
  const daysInWeek = 7;
  const defaultDailyData: IDailyData[] = [];

  for (let i = 0; i < daysInWeek; i++) {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(currentDate.getDate() + i);
    defaultDailyData.push({
      _id: new mongoose.Types.ObjectId(),
      date: currentDate,
      calories: 0,
      protein: 0,
      weight: 0,
      steps: 0,
    } as IDailyData); 
  }

  return defaultDailyData;
};

export const WeeklyFitnessDataSchema = new Schema<IWeeklyFitnessData>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is missing."],
    },
    trainingPlanId: { type: Schema.Types.ObjectId, required: true },
    weekStartDate: { type: Date, required: [true, "Start date is missing."] },
    weekEndDate: { type: Date, required: [true, "End date is missing."] },
    dailyData: {
      type: [DailyDataSchema],
      default: function () {
        return generateDefaultDailyData(this.weekStartDate);
      },
    },
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    averageWeight: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    id: false,
    versionKey: false,
  }
);

export const WeeklyFitnessData = model<IWeeklyFitnessData>(
  "WeeklyFitnessData",
  WeeklyFitnessDataSchema,
  "weekly-fitness-data"
);
