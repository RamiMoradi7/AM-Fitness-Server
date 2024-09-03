import { randomBytes } from "crypto";
import { cyber } from "../2-utils/cyber";
import { resetPasswordMail } from "../3-config/mailer";
import { ValidationError } from "../4-models/client-errors";
import { ICredentials } from "../4-models/credentials";
import { RoleModel } from "../4-models/enums";
import { IUser, User } from "../4-models/user";

class AuthService {
  public async register(user: IUser): Promise<string> {
    const errors = user.validateSync();
    if (errors) throw new ValidationError(errors.message);

    const isTaken = await this.isEmailTaken(user.email);

    if (isTaken) throw new ValidationError("Email is already taken.");

    user.email = user.email.toLowerCase();
    user.password = cyber.hashPassword(user.password);
    user.roleId = RoleModel.User;

    const addedUser = await user.save();
    user.id = addedUser._id;
    const token = cyber.getNewToken(user);
    return token;
  }

  public async login(credentials: ICredentials): Promise<string> {
    credentials.validateSync();
    credentials.password = cyber.hashPassword(credentials.password);
    const user = await User.findOne({
      email: credentials.email.toLowerCase(),
      password: credentials.password,
    })
    .exec();
    if (!user) {
      throw new ValidationError("אחד מהפרטים שהזנת שגויים.");
    }
    user.isActive = true;
    user.lastLogin = new Date();
    await user.save();
    const token = cyber.getNewToken({
      _id: user._id,
      roleId: user.roleId,
    });
    return token;
  }

  private generateShortToken(): string {
    return randomBytes(16).toString("hex");
  }

  public async passwordResetRequest(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) throw new ValidationError("אימייל שגוי, נסה שנית.");
    const token = this.generateShortToken();
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    const emailContent = ` לחץ על הלינק הבא כדי לאפס את הסיסמא שלך:  ${resetUrl}`;
    await resetPasswordMail(
      user.email,
      "AM Fitness - איפוס סיסמא",
      emailContent
    );
  }

  public async validatePasswordResetToken(token: string): Promise<boolean> {
    if (!token) throw new ValidationError("No token provided.");
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    }).exec();

    if (!user) throw new ValidationError("Token not exists.");
    return true;
  }

  public async changeUserPassword(
    token: string,
    newPassword: string
  ): Promise<string> {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    }).exec();

    if (!user) throw new ValidationError("Invalid or expired token.");

    user.password = cyber.hashPassword(newPassword);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    const newToken = cyber.getNewToken(user);
    return newToken;
  }

  private async isEmailTaken(email: string): Promise<boolean> {
    const existingUser = await User.findOne({ email }).exec();
    if (!existingUser) {
      return false;
    }
    return true;
  }
}

export const authService = new AuthService();
