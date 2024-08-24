import { model, Schema } from "mongoose";
import { IUser } from "./user";

export interface ICredentials extends Pick<IUser, "email" | "password"> {
  validateSync(): unknown;
}

export const CredentialsSchema = new Schema<ICredentials>(
  {
    email: {
      type: String,
      required: [true, "Email is missing."],
    },
    password: {
      type: String,
      required: [true, "Password is missing."],
    },
  },
  { autoCreate: false }
);

export const Credentials = model<ICredentials>(
  "ICredentials",
  CredentialsSchema
);
