import bcrypt from "bcryptjs";
import { getDeletedUserEmailContent } from "@/constants/email";
import { sendEmail } from "@/lib/sendEmail";
import User, { UserType } from "@/models/user.model";
import { UpdateUserType } from "@/schema/user.schema";
import { sendVerificationEmail } from "@/lib";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";

// update an existing user
export const updateUser = async (
  data: Partial<UpdateUserType>,
  user: UserType
) => {
  let newEmail = user.email;
  let isVerified = user.verified;
  let message = "";

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  if (data.email && data.email !== user.email) {
    newEmail = data.email;
    isVerified = false;
    message =
      "Profile updated successfully. A verification code to verify the new email address has been sent.";
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    { ...data, email: newEmail, verified: isVerified },
    {
      new: true,
    }
  );

  if (!updatedUser) {
    throw createHttpError(
      "An error occurred while updating your profile. Try again later",
      HttpStatusCode.InternalServerError
    );
  }

  if (updatedUser?.verified === false) {
    await sendVerificationEmail(
      updatedUser.email,
      updatedUser._id.toString(),
      updatedUser.username,
      "update"
    );
  }

  return {
    success: true,
    data: updatedUser!,
    message: message !== "" ? message : "Profile updated successfully.",
  };
};

// delete an existing user
export const deleteUser = async (userId: string) => {
  const deletedUser = await User.findOneAndDelete({ _id: userId });

  if (!deletedUser) {
    throw createHttpError(
      "An error occurred while deleting your account. Try again later",
      HttpStatusCode.InternalServerError
    );
  }

  const content = getDeletedUserEmailContent(deletedUser?.username);
  const subject = "Account Deleted";
  const messageId = await sendEmail(deletedUser!.email, subject, content);

  console.log({ messageId });
};
