export type RequestPasswordResetInput = {
  email: string;
  ipHash?: string | null;
  userAgent?: string | null;
};

export type RequestPasswordResetResult = {
  sent: boolean;
};

export type ConfirmPasswordResetInput = {
  token: string;
  password: string;
};
