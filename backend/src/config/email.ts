import nodemailer from "nodemailer";

const nodemailerTransporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: Number(process.env.NODEMAILER_PORT),
  secure: Number(process.env.NODEMAILER_PORT) === 465,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

export default nodemailerTransporter;
