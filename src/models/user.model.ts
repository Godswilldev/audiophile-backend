/* eslint-disable no-invalid-this */
import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import valid from "validator";
import { Schema, model, Model, Query, SchemaTypes } from "mongoose";
import { UserProps, UserMethods, roles } from "../interface/user.interface";

const { SALT_ROUNDS } = process.env;

export type UserModel = Model<UserProps, {}, UserMethods>;

const userSchema = new Schema<UserProps, UserModel, UserMethods>(
  {
    firstname: {
      type: String,
      minlength: 2,
      maxlength: 20,
      required: [true, "Please enter your First name"],
    },

    lastname: {
      type: String,
      minlength: 2,
      maxlength: 20,
      required: [true, "Please enter your Last name"],
    },

    phoneNumber: {
      type: String,
      minlength: 8,
      maxlength: 14,
      required: [true, "Please enter your Phone Number"],
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Please enter your Email"],
      validate: [valid.isEmail, "Please enter a valid email"],
    },

    photo: { type: String, default: "default.jpg" },

    password: {
      type: String,
      minlength: 6,
      required: [true, "Please provide a password"],
      select: false,
    },

    passwordConfirm: {
      type: String,
      minlength: 6,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on create() or save()
        validator: function (el: string): Boolean {
          const user = this as UserProps;
          return el === user.password;
        },
        message: "Passwords aren't the same",
      },
    },

    role: {
      type: String,
      enum: [roles.admin, roles.user, roles.manager],
      default: roles.user,
    },

    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    favouriteProducts: [{ type: SchemaTypes.ObjectId, ref: "Product" }],

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
  },
  { versionKey: false }
);

// Document middleware (this points to the current document)
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) {
    return next();
  } else {
    // hash and salt the password, since it wasn't modified
    this.password = await bcrypt.hash(this.password, Number(SALT_ROUNDS as string));
    // delete the passwordConfirm field from the database
    this.passwordConfirm = undefined;
    next();
  }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// query middleware (to exclude all users whose active property is set to false)
// (This is for users who deleted their account)
userSchema.pre<Query<UserProps, UserModel>>(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// check if the password the user entered is the same with the password in the database
userSchema.methods.comparePasswords = async function (
  enteredPassword: string,
  encryptedPassword: string
) {
  return await bcrypt.compare(enteredPassword, encryptedPassword);
};

// check if the password was changed
userSchema.methods.changedPasswordAfter = function (jwtTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // create unencrypted reset token
  const resetToken = crypto.randomBytes(3).toString("hex");
  // create and save encrypted reset token to database
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  // send the unencrypted reset token to users email
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(3).toString("hex");
  this.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  this.emailVerificationTokenExpires = Date.now() + 10 * 60 * 1000;
  return verificationToken;
};

// Adding products to favourites
userSchema.methods.AddOrRemoveFavouriteProduct = function (productId: string) {
  const objectIds = this.favouriteProducts.map((product: string) => product.toString());

  if (!objectIds.includes(productId)) {
    this.favouriteProducts = this.favouriteProducts.push(productId);
  } else {
    this.favouriteProducts = this.favouriteProducts.filter(
      (product: string) => product.toString() !== productId
    );
  }
};

const User = model<UserProps, UserModel>("User", userSchema);

export default User;
