import jwt from "jsonwebtoken";
import { CreateUserType } from "@/schema/user.schema";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import Code from "@/models/code.model";
import { sendConfirmationEmail } from "@/lib";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";

interface DecodedToken {
  email: string;
  codeHash: string;
}

// find a single user
export const findUser = async (
  data: string,
  selectPassword: boolean = false,
  findById: boolean = false
) => {
  const user = await User.findOne(
    findById
      ? { _id: data }
      : {
          $or: [{ email: data }, { username: data }],
        }
  )
    .select(selectPassword ? "" : "-password")
    .lean()
    .exec();

  if (selectPassword && (!user || user === null)) {
    throw createHttpError("Invalid credentials", HttpStatusCode.Unauthorized);
  } else {
    if (!user || user === null) {
      throw createHttpError("User not found", HttpStatusCode.NotFound);
    }
  }

  // return user
  return user!;
};

// create a new user
export const createUser = async (data: CreateUserType) => {
  const user = await User.create(data);

  if (!user) {
    throw createHttpError(
      "User creation failed",
      HttpStatusCode.InternalServerError
    );
  }

  return findUser(user.email);
};

// verity email address
export const verifyEmail = async (verificationCode: string, userId: string) => {
  try {
    const code = await Code.findOne({ $and: [{ userId }, { type: "EMAIL" }] })
      .lean()
      .exec();

    // check if the verification code exists
    if (!code || !bcrypt.compareSync(verificationCode, code.codeHash)) {
      throw createHttpError(
        "Invalid verification code",
        HttpStatusCode.Unauthorized
      );
    }

    // check if the verification code is expired
    const decoded = jwt.verify(
      code!.token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    if (!decoded || !decoded.email) {
      throw createHttpError(
        "Verification code expired. Request for another one",
        HttpStatusCode.Unauthorized
      );
    }

    // update the user's email verification status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { verified: true },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(
        "An error occurred while verifying your email",
        HttpStatusCode.InternalServerError
      );
    }

    sendConfirmationEmail(updatedUser!.email, updatedUser!.username);

    return updatedUser;
  } catch (error: any) {
    // if jwt expired error
    if (error.message === "jwt expired") {
      throw createHttpError(
        "Verification code expired. Request for another one"
      );
    } else {
      throw createHttpError(error.message);
    }
  } finally {
    await Code.findOneAndDelete({ userId });
  }
};

// reset user password
export const resetUserPassword = async (
  userId: string,
  password: string,
  verificationCode: string
) => {
  const user = await findUser(userId, false, true);

  const code = await Code.findOne({
    $and: [{ userId: user._id }, { type: "PASSWORD" }],
  })
    .lean()
    .exec();

  if (!code) {
    throw createHttpError(
      "No verification code found",
      HttpStatusCode.Unauthorized
    );
  }

  if (!bcrypt.compareSync(verificationCode, code!.codeHash)) {
    throw createHttpError(
      "Invalid verification code",
      HttpStatusCode.Unauthorized
    );
  }

  const decoded = jwt.verify(
    code!.token,
    process.env.JWT_SECRET!
  ) as DecodedToken;

  if (!decoded) {
    throw createHttpError(
      "Verification code expired. Request for another one",
      HttpStatusCode.Unauthorized
    );
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { password: hashedPassword },
    { new: true }
  )
    .select("-password")
    .lean()
    .exec();

  if (!updatedUser) {
    throw createHttpError(
      "An error occurred while resetting your password. Try again later.",
      HttpStatusCode.InternalServerError
    );
  }

  await Code.findOneAndDelete({
    $and: [{ userId: updatedUser!._id }, { type: "PASSWORD" }],
  });

  return updatedUser!;
};
