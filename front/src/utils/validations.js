// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

// Name validation
export const validateName = (name, fieldName) => {
  const nameValue = (name ?? "").trim();
  if (nameValue === "") {
    return `${fieldName} is required`;
  }
  if (!/^\p{L}+$/u.test(nameValue)) {
    return `${fieldName} can only contain letters`;
  }
  return null;
};

// Password validation
export const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  return null;
};

// Password match validation
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
};

// Phone number validation
export const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return "Please enter a valid 10-digit phone number";
  }
  return null;
};

// Required fields validation
export const validateRequiredFields = (formData) => {
  const requiredFields = [
    "email",
    "first_name",
    "last_name",
    "phone_number",
    "password",
    "confirmPassword",
  ];
  const emptyFields = requiredFields.filter(
    (field) => !formData[field]?.trim()
  );

  if (emptyFields.length > 0) {
    return `Please fill in all fields: ${emptyFields
      .map((field) => field.replace("_", " "))
      .join(", ")}`;
  }
  return null;
};

// Capitalize first letter helper
export const capitalizeFirstLetter = (string) => {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
