import { Document, Schema, model } from "mongoose";

interface IExercize {
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

export interface ITrainingPlan extends Document {
  user: Schema.Types.ObjectId;
  name: string;
  description: string;
  exercizes: IExercize[];
  duration: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExercizeSchema = new Schema<IExercize>({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  rest: { type: Number, required: true },
});

const TrainingPlanSchema = new Schema<ITrainingPlan>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "User is missing."],
      ref: "User",
    },
    name: { type: String, required: [true, "Training plan name is missing."] },
    description: { type: String, required: [true, "Description is missing."] },
    exercizes: [ExercizeSchema],
    duration: { type: Number, required: [true, "Duration is missing."] },
  },
  { timestamps: true, id: false }
);

export const TrainingPlan = model<ITrainingPlan>(
  "TrainingPlan",
  TrainingPlanSchema,
  "training-plans"
);
