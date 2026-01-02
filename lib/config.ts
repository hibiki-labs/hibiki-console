export const isOTPEnabled = (): boolean => {
  return process.env.ENABLE_OTP === 'true';
};
