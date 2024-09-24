import mongoose, { Document, Schema, model } from "mongoose";
import { IExercise } from "./exercise";

export interface ISet {
  _id?: Schema.Types.ObjectId;
  weight: number;
  reps: number;
  effortLevel: number;
}

interface ExercisesWithDetails {
  exercise: IExercise;
  setDetails: ISet[];
  excId: mongoose.Types.ObjectId;
}

export interface IDay {
  dayOfWeek: string;
  exercises: ExercisesWithDetails[];
}

export interface IWeek extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  trainingPlan: mongoose.Types.ObjectId;
  weekNumber: number;
  days: IDay[];
  startDate: Date;
  endDate: Date;
  weeklyFitnessData: mongoose.Types.ObjectId;
}

const SetDetailsSchema = new Schema<ISet>({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  weight: { type: Number },
  reps: { type: Number },
  effortLevel: {
    type: Number,
    min: [1, "Effort level must be at least 1."],
    max: [10, "Effort level must not exceed 10."],
  },
});

const ExerciseWithSetsSchema = new Schema({
  exercise: {
    type: Schema.Types.ObjectId,
    ref: "Exercise",
    required: [true],
  },
  setDetails: {
    type: [SetDetailsSchema],
    default: () => [
      { weight: 0, reps: 0, effortLevel: 1 },
      { weight: 0, reps: 0, effortLevel: 1 },
      { weight: 0, reps: 0, effortLevel: 1 },
    ],
  },
});

const DaySchema = new Schema<IDay>({
  dayOfWeek: { type: String, required: [true, "Day of week is required"] },
  exercises: [
    {
      type: ExerciseWithSetsSchema,
      required: [true],
    },
  ],
});

const WeekSchema = new Schema<IWeek>(
  {
    weekNumber: { type: Number, required: true },
    trainingPlan: { type: Schema.Types.ObjectId, ref: "TrainingPlan" },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User id is missing."],
    },
    days: [DaySchema],
    weeklyFitnessData: {
      type: Schema.Types.ObjectId,
      ref: "WeeklyFitnessData",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  {
    versionKey: false,
    id: false,
  }
);

WeekSchema.index({ weekNumber: 1, trainingPlan: 1 }, { unique: true });

export const Week = model<IWeek>("Week", WeekSchema, "weeks");
