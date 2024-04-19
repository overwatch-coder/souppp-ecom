import mongoose from "mongoose";

export interface CodeType {
  userId: mongoose.Types.ObjectId;
  codeHash: string;
  type: string;
  token: string;
}

const codeSchema = new mongoose.Schema<CodeType>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    codeHash: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "EMAIL",
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

mongoose.set("strictPopulate", false);

const Code = mongoose.model("Code", codeSchema);

export default Code;
