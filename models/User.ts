import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";

// USER DOC TYPE
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  country: string;
  role: string;
}

//  INSTANCE METHODS TYPE
interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

//  MODEL TYPE
type UserModel = Model<IUser, {}, IUserMethods>;

// SCHEMA
const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    country: { type: String, required: true },
    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "{VALUE} is not a supported role",
      },
      default: "user",
    },
  },
  { timestamps: true },
);

//  PRE-SAVE HOOK
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// METHOD
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// EXPORT MODEL
const User =
  (mongoose.models.User as UserModel) ||
  mongoose.model<IUser, UserModel>("User", UserSchema);

export default User;
