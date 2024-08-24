import { Document, Schema, Types, model } from "mongoose";

interface IMeal {
  name: string;
  ingredients: string[];
  calories: string;
  protein?: number;
  fat?: number;
}

export interface IDietaryMenu extends Document {
  user: Schema.Types.ObjectId;
  name: string;
  description: string;
  meals: IMeal[];
  createdAt?: Date;
  updatedAt: Date;
}

const MealSchema = new Schema<IMeal>({
  name: { type: String, required: [true, "Meal name is missing."] },
  ingredients: { type: [String], required: [true, "Ingredients is missing."] },
  calories: { type: String, required: [true, "Calories is missing."] },
  protein: { type: Number },
  fat: { type: Number },
});

export const DietaryMenuSchema = new Schema<IDietaryMenu>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "User is missing."],
      ref: "User",
    },
    name: { type: String, required: [true, "Menu name is missing."] },
    description: {
      type: String,
      required: [true, "Menu Description is missing."],
    },

    meals: [MealSchema],
  },
  { timestamps: true, id: false }
);

export const DietaryMenu = model<IDietaryMenu>(
  "DietaryMenu",
  DietaryMenuSchema,
  "dietary-menus"
);
