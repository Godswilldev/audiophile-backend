/* eslint-disable require-jsdoc */

// CLASS TO HANDLE APP ERRORS
export const AppError = class extends Error {
  public readonly status: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  // eslint-disable-next-line space-before-function-paren
  constructor(message: string, statusCode: number) {
    super();

    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "Failed" : "Error";
    this.isOperational = true;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
};
