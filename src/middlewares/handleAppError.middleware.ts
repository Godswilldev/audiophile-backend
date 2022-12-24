/* eslint-disable require-jsdoc */

// CLASS TO HANDLE APP ERRORS
export const AppError = class extends Error {
  public readonly status: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string | undefined, statusCode: number) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "Failed" : "Error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};
