import { UploadedFile } from "express-fileupload";
import { ResourceNotFoundError } from "../4-models/client-errors";
import { IUser, User } from "../4-models/user";
import { fileSaver } from "uploaded-file-saver";

type UpdateUserProps = {
  userId: string;
  fields: Partial<IUser>;
  image?: UploadedFile;
};

class UsersService {
  public async getUsers(): Promise<IUser[]> {
    const users = await User.find().exec();
    return users;
  }

  public async getUser(userId: string): Promise<IUser> {
    const user = await User.findById(userId).exec();
    if (!user) throw new ResourceNotFoundError(userId);
    return user;
  }

  public async updateUser({
    userId,
    fields,
    image,
  }: UpdateUserProps): Promise<IUser> {
    const user = await this.getUser(userId);

    if (image) {
      const imageName = await this.handleImageUpload(userId, image);
      user.photo = imageName;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fields },
      { new: true }
    );
    if (!updatedUser) throw new ResourceNotFoundError(userId);
    return updatedUser;
  }

  public async deleteUser(userId: string): Promise<void> {
    const userToDelete = await User.findByIdAndDelete(userId);
    if (!userToDelete) throw new ResourceNotFoundError(userId);
  }

  private async handleImageUpload(
    userId: string,
    image: UploadedFile
  ): Promise<string> {
    const oldImageName = await this.getImageName(userId);
    const newImageName = oldImageName
      ? await fileSaver.update(oldImageName, image)
      : await fileSaver.add(image);
    return newImageName;
  }

  private async getImageName(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    return user.photo || "";
  }
}

export const usersService = new UsersService();
