export const CUSTOMER_PASSWORD_MIN_LENGTH = 8;

export type CustomerPasswordChecks = {
  hasLetter: boolean;
  hasMinimumLength: boolean;
  hasNumber: boolean;
  passwordsMatch: boolean;
};

export function getCustomerPasswordChecks(
  password: string,
  passwordConfirmation: string,
): CustomerPasswordChecks {
  return {
    hasLetter: /[A-Za-z]/.test(password),
    hasMinimumLength: password.length >= CUSTOMER_PASSWORD_MIN_LENGTH,
    hasNumber: /[0-9]/.test(password),
    passwordsMatch:
      passwordConfirmation.length > 0 && password === passwordConfirmation,
  };
}
