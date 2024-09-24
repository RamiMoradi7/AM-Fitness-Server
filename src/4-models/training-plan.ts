import mongoose, { Document, Schema, model } from "mongoose";

export interface ITrainingPlan extends Document {
  user: Schema.Types.ObjectId;
  name: string;
  description?: string;
  weeks: mongoose.Types.ObjectId[];
  durationInMonths: number;
  goal?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TrainingPlanSchema = new Schema<ITrainingPlan>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "User is missing."],
      ref: "User",
    },
    name: { type: String },
    description: { type: String },
    durationInMonths: {
      type: Number,
      required: [true, "Duration is missing."],
    },
    weeks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Week",
      },
    ],
    goal: { type: String },
  },
  { timestamps: true, id: false, versionKey: false }
);

export const TrainingPlan = model<ITrainingPlan>(
  "TrainingPlan",
  TrainingPlanSchema,
  "training-plans"
);
