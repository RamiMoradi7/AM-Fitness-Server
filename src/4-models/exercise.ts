import { Document, Schema, model } from "mongoose";

type Category = "גב" | "כתפיים" | "ידיים" | "רגליים" | "חזה" | "ישבן";

export interface IExercise extends Document {
  name: string;
  sets: number;
  reps: number;
  rest: number;
  category: Category;
  weight?: number;
  notes?: { text: string }[];
}

const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    rest: { type: Number, required: true },
    category: {
      type: String,
      enum: ["גב", "כתפיים", "ידיים", "רגליים", "חזה", "ישבן"],
          required: [true, "Category is missing."],
    },
    weight: { type: Number },
    notes: [{ text: { type: String } }],
  },
  {
    versionKey: false,
    id: false,
  }
);

export const Exercise = model<IExercise>(
  "Exercise",
  ExerciseSchema,
  "exercises"
);
