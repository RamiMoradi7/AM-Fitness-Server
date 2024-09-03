import { Document, Schema, model } from "mongoose";
import { IExercise } from "./exercise";

interface IDay {
  dayOfWeek: string;
  exercises: IExercise;
}

export interface ITrainingPlan extends Document {
  user: Schema.Types.ObjectId;
  name: string;
  description?: string;
  days: IDay[];
  duration: number;
  goal?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DaySchema = new Schema<IDay>({
  dayOfWeek: { type: String, required: [true, "Day of week is required"] },
  exercises: [
    {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: [true, "Exercise id is missing."],
    },
  ],
});

const TrainingPlanSchema = new Schema<ITrainingPlan>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "User is missing."],
      ref: "User",
    },
    name: { type: String },
    description: { type: String },
    days: {
      type: [DaySchema],
      required: [true, "Training plan days are missing."],
    },
    duration: { type: Number, required: [true, "Duration is missing."] },
    goal: { type: String },
  },
  { timestamps: true, id: false, versionKey: false }
);

export const TrainingPlan = model<ITrainingPlan>(
  "TrainingPlan",
  TrainingPlanSchema,
  "training-plans"
);
