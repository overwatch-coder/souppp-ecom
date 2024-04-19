import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least 3 characters long" }),
  username: z
    .string({ required_error: "Username is required" })
    .min(3, { message: "Username must be at least 3 characters long" })
    .trim()
    .toLowerCase(),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .trim(),
  confirmPassword: z
    .string({ required_error: "Confirm Password is required" })
    .trim(),
  verified: z.boolean().default(false),
  role: z.enum(["MERCHANT", "USER"]).default("USER"),
  _id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  verificationCode: z.string(),
  userId: z.string(),
});

export const createUserSchema = userSchema
  .omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
    verificationCode: true,
    userId: true,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = userSchema
  .pick({ email: true, password: true, confirmPassword: true })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyUserSchema = userSchema.pick({
  verificationCode: true,
  userId: true,
});

export const updateUserSchema = userSchema.pick({
  email: true,
  name: true,
  password: true,
  username: true,
});

export type CreateUserType = z.infer<typeof createUserSchema>;
export type LoginUserType = z.infer<typeof loginUserSchema>;
export type VerifyUserType = z.infer<typeof verifyUserSchema>;
export type UpdateUserType = z.infer<typeof updateUserSchema>;
