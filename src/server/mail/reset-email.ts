export type PasswordResetEmail = {
  subject: string;
  text: string;
  html: string;
};

export function buildPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}): PasswordResetEmail {
  return {
    subject: "Reset your password",
    text: `Reset your password: ${input.resetUrl}`,
    html: `<p>Reset your password</p><p><a href="${input.resetUrl}">${input.resetUrl}</a></p>`,
  };
}

export const buildResetPasswordEmail = buildPasswordResetEmail;
