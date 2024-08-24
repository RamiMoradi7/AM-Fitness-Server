import { Document, Schema, model } from "mongoose";
import { appConfig } from "../2-utils/app-config";
import { RoleModel } from "./enums";

type GenderOptions = "male" | "female" | "other";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  gender: GenderOptions;
  password: string;
  birthday?: Date;
  age?: number;
  photo?: string;
  notificationsEnabled?: boolean;
  isActive?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  roleId: RoleModel;
  trainingPlans?: Schema.Types.ObjectId[];
  dietaryMenus?: Schema.Types.ObjectId[];
  resetToken?: string;
  resetTokenExpires?: number;
}
export const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is missing"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is missing"],
    },
    email: {
      type: String,
      required: [true, "Email is missing."],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is missing."],
    },
    password: {
      type: String,
      select: false,
    },
    birthday: {
      type: Date,
      required: [true, "Birthday is missing."],
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
    },
    photo: {
      type: String,
    },
    notificationsEnabled: { type: Boolean },
    isActive: {
      type: Boolean,
      default: true,
      required: false,
    },
    lastLogin: { type: Date },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    roleId: {
      type: Number,
      required: false,
      validate: {
        validator: (value: number) =>
          [RoleModel.Admin, RoleModel.User].includes(value),
        message: "Invalid role id.",
      },
    },
    resetToken: { type: String },
    resetTokenExpires: { type: Number },
  },
  {
    versionKey: false,
    id: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

function calculateAge(birthday: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDifference = today.getMonth() - birthday.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthday.getDate())
  ) {
    age--;
  }
  return age;
}

UserSchema.pre<IUser>("save", function (next) {
  if (this.isModified("birthday")) {
    this.age = calculateAge(this.birthday);
  }
  next();
});

UserSchema.virtual("imageUrl").get(function (this: IUser) {
  return this.photo ? appConfig.baseImageUrl + this.photo : null;
});

export const User = model<IUser>("User", UserSchema, "users");
