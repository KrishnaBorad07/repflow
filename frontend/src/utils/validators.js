export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password) {
  return password.length >= 8;
}

export function isRequired(value) {
  return value !== null && value !== undefined && value.toString().trim().length > 0;
}

export function isPositiveNumber(value) {
  return !isNaN(value) && Number(value) > 0;
}

export function validateSignup({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!isRequired(name)) errors.name = 'Name is required';
  if (!isValidEmail(email)) errors.email = 'Valid email is required';
  if (!isValidPassword(password)) errors.password = 'Password must be at least 8 characters';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords must match';
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!isValidEmail(email)) errors.email = 'Valid email is required';
  if (!isRequired(password)) errors.password = 'Password is required';
  return errors;
}
