import asyncHandler from "express-async-handler";
import {
  CreateUserType,
  LoginUserType,
  VerifyUserType,
} from "@/schema/user.schema";
import {
  createUser,
  findUser,
  resetUserPassword,
  verifyEmail,
} from "@/services/user.service";
import { Request, Response } from "express";
import {
  comparePassword,
  generateToken,
  generateVerificationCode,
  sendConfirmationEmail,
  sendVerificationEmail,
} from "@/lib";
import {
  getForgotPasswordEmailContent,
  getResetPasswordConfirmationEmailContent,
} from "@/constants/email";
import validator from "validator";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";
import User from "@/models/user.model";

/**
  @desc    REGISTER A NEW USER
  @route   /api/users/register
  @access  public
*/
export const registerUser = asyncHandler(
  async (req: Request<any, any, CreateUserType>, res: Response) => {
    const data = req.body;

    // check if password is strong enough
    if (!validator.isStrongPassword(data.password)) {
      throw createHttpError(
        "Password is not strong enough",
        HttpStatusCode.BadRequest
      );
    }

    // check if email already exists
    const emailAlreadyExists = await User.findOne({ email: data.email })
      .lean()
      .exec();

    if (emailAlreadyExists) {
      throw createHttpError("User already exists", HttpStatusCode.BadRequest);
    }

    // check if username already exists
    const usernameAlreadyExists = await User.findOne({
      username: data.username,
    });

    if (usernameAlreadyExists) {
      throw createHttpError(
        "Username already taken. Please choose another one",
        HttpStatusCode.BadRequest
      );
    }

    const user = await createUser(data);

    sendVerificationEmail(user.email, user._id.toString(), user.username);

    res.status(201).json({
      success: true,
      data: user,
      message: "Account created successfully. Continue to verify your account",
    });
  }
);

/**
  @desc    VERIFY CREATED USER
  @route   /api/users/verify
  @access  public
*/
export const verifyUser = asyncHandler(
  async (req: Request<any, any, VerifyUserType>, res: Response) => {
    const { verificationCode, userId } = req.body;

    const user = await findUser(userId, false, true);

    await verifyEmail(verificationCode, user._id.toString());

    res.status(200).json({
      success: true,
      data: null,
      message: "Account verification successful.",
    });
  }
);

/**
  @desc    REQUEST A NEW VERIFICATION CODE
  @route   /api/users/request-code
  @access  public
*/
export const requestVerificationCode = asyncHandler(
  async (req: Request<any, any, { email: string }>, res: Response) => {
    const { email } = req.body;
    if (!email || email === "") {
      throw createHttpError("Email is required", HttpStatusCode.BadRequest);
    }

    const user = await findUser(email);

    if (user.verified) {
      throw createHttpError("User already verified", HttpStatusCode.BadRequest);
    }

    sendVerificationEmail(user.email, user._id.toString(), user.username);

    res.status(200).json({
      success: true,
      data: null,
      message:
        "Check your email for your verification code if you already have an account with us.",
    });
  }
);

/**
  @desc    LOGIN AN EXISTING USER
  @route   /api/users/login
  @access  public
*/
export const loginUser = asyncHandler(
  async (req: Request<any, any, LoginUserType>, res: Response) => {
    const { email, password: clientPassword } = req.body;
    
    const user = await findUser(email, true);

    const isPasswordCorrect = await comparePassword(
      clientPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      throw createHttpError("Invalid credentials", HttpStatusCode.Unauthorized);
    }

    if (!user.verified) {
      sendVerificationEmail(user.email, user._id.toString(), user.username);
      const { password, updatedAt, ...rest } = user;

      res.status(200).json({
        success: true,
        data: rest,
        message:
          "Account not verified. Check your email for your verification code.",
      });
    }

    const token = generateToken(res, user._id.toString());

    const { password, ...rest } = user;

    res.status(200).json({
      success: true,
      data: rest,
      message: "You've successfully logged in.",
      token
    });
  }
);

/**
  @desc    LOGOUT A USER
  @route   /api/users/logout
  @access  public
*/
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("access_token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    data: null,
    message: "You have successfully logged out",
  });
});

// FORGOT AND RESET PASSWORD

/**
  @desc    REQUEST CODE TO RESET PASSWORD
  @route   /api/users/forgot-password
  @access  public
*/
export const forgotPassword = asyncHandler(
  async (req: Request<any, any, { email: string }>, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw createHttpError("Email is required", HttpStatusCode.BadRequest);
    }

    if (!validator.isEmail(email)) {
      throw createHttpError("Invalid email address", HttpStatusCode.BadRequest);
    }

    const user = await findUser(email);

    if (!user) {
      throw createHttpError("User not found", HttpStatusCode.Unauthorized);
    }

    const code = generateVerificationCode();
    const verificationLink = `${process.env.FRONTEND_URL}/reset-password?token=${code}_${user._id}`;
    const subject = "Reset Password | Souppp";
    const content = getForgotPasswordEmailContent(
      user.username,
      verificationLink
    );

    sendVerificationEmail(
      user.email,
      user._id.toString(),
      user.username,
      "Reset Password",
      true,
      subject,
      content,
      code
    );

    res.status(200).json({
      success: true,
      data: null,
      message:
        "Check your email for your verification link if you already have an account with us.",
    });
  }
);

/**
  @desc    SET A NEW PASSWORD
  @route   /api/users/reset-password
  @access  public
*/
export const resetPassword = asyncHandler(
  async (
    req: Request<any, any, { password: string; token: string }>,
    res: Response
  ) => {
    const { token, password } = req.body;

    if (!token) {
      throw createHttpError(
        "Password verification token is required",
        HttpStatusCode.BadRequest
      );
    }

    if (!password) {
      throw createHttpError("Password is required", HttpStatusCode.BadRequest);
    }

    if (!validator.isStrongPassword(password)) {
      throw createHttpError(
        "Password is not strong enough",
        HttpStatusCode.BadRequest
      );
    }

    const verificationCode = token.split("_")[0];
    const userId = token.split("_")[1];

    const user = await resetUserPassword(userId, password, verificationCode);

    const subject = "Password Reset Successfully";
    const content = getResetPasswordConfirmationEmailContent(user.username);

    sendConfirmationEmail(user.email, user.username, subject, content);

    res.status(200).json({
      success: true,
      data: null,
      message: "Password reset successfully",
    });
  }
);
