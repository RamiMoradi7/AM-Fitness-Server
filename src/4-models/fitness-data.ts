import mongoose, { Document, model, Schema } from "mongoose";

export interface IDailyData extends Document {
  date: Date;
  calories: number;
  protein: number;
  weight: number;
  steps: number;
}

export interface IWeeklyFitnessData extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  dailyData: IDailyData[];
  totalCalories: number;
  totalProtein: number;
  averageWeight: number;
  totalSteps: number;
  createdAt: Date;
  updatedAt: Date;
}

export const DailyDataSchema = new Schema<IDailyData>({
  date: { type: Date, required: [true, "Date is missing."] },
  calories: { type: Number, required: [true, "Calories is missing."] },
  protein: { type: Number, required: [true, "Protein is missing."] },
  weight: { type: Number, required: [true, "Weight is missing."] },
  steps: { type: Number, required: [true, "Steps is missing."] },
});

export const WeeklyFitnessDataSchema = new Schema<IWeeklyFitnessData>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is missing."],
    },
    weekStartDate: { type: Date, required: [true, "Date is missing."] },
    dailyData: { type: [DailyDataSchema], default: [] },
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
