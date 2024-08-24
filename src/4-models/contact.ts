import { Document, Schema, model } from "mongoose";

export interface IContact extends Document {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    fullName: { type: String, required: [true, "Fullname is missing."] },
    email: { type: String, required: [true, "Email is missing."] },
    phone: { type: String, required: [true, "Phone is missing."] },
    message: { type: String, required: [true, "Message is missing."] },
    createdAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Contact = model<IContact>("Contact", ContactSchema, "contacts");
