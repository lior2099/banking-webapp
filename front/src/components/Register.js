import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  TextField,
  Container,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  validateName,
  validatePassword,
  validatePasswordMatch,
  validatePhoneNumber,
  capitalizeFirstLetter,
} from "../utils/validations.js";
import EmailIcon from "@mui/icons-material/Email";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddIcCallIcon from "@mui/icons-material/AddIcCall";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import validator from "validator";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [openVerification, setOpenVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Toast (snackbar) state
  const [toast, setToast] = useState({
    open: false,
    severity: "success",
    message: "",
  });
  const showToast = (message, severity = "success") =>
    setToast({ open: true, severity, message });
  const closeToast = (_, reason) => {
    if (reason === "clickaway") return;
    setToast((t) => ({ ...t, open: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "first_name" || name === "last_name") {
      newValue = capitalizeFirstLetter(value);
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));

    // Clear the error for the field being edited
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    let hasErrors = false;
    const newErrors = {};

    // Email validation
    if (!validator.isEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    // First name validation
    const firstNameError = validateName(formData.first_name, "First name");
    if (firstNameError) {
      newErrors.first_name = firstNameError;
      hasErrors = true;
    }

    // Last name validation
    const lastNameError = validateName(formData.last_name, "Last name");
    if (lastNameError) {
      newErrors.last_name = lastNameError;
      hasErrors = true;
    }

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
      hasErrors = true;
    }

    // Confirm password validation
    const passwordMatchError = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );
    if (passwordMatchError) {
      newErrors.confirmPassword = passwordMatchError;
      hasErrors = true;
    }

    // Phone validation
    const phoneError = validatePhoneNumber(formData.phone_number);
    if (phoneError) {
      newErrors.phone_number = phoneError;
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/sign-up", {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        password: formData.password,
      });

      setVerificationCode("");

      if (response.status === 201) {
        setUserEmail(formData.email);
        setOpenVerification(true);
        setErrorMessage(null);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          email: "User with this email already exists",
        }));
      } else {
        setErrorMessage(error.response?.data?.message || "Registration failed");
      }
      console.error("Registration error:", error);
    }
  };

  const handleVerificationSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/sign-up/confirmation",
        {
          passcode: verificationCode,
        }
      );

      if (response.status === 201) {
        setOpenVerification(false);
        showToast("Registration successful!", "success");
        setTimeout(() => navigate("/", { replace: true }), 1200);
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setErrorMessage(
              error.response.data.message || "Invalid verification code"
            );
            break;
          case 500:
            setErrorMessage("Server error, please try again later");
            break;
          default:
            setErrorMessage("Verification failed");
        }
      } else {
        setErrorMessage("An error occurred during verification");
      }
    }
  };

  const handleResendCode = async () => {
    const sendRequest = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/sign-up/re-send",
          {
            email: userEmail,
          }
        );
        if (response.status === 201) {
          setErrorMessage(null);
          setSuccessMessage("Verification code resent successfully");
          showToast("Verification code resent", "info");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          // Try to refresh token
          try {
            const refreshToken = localStorage.getItem("Refresh_Token");
            const refreshResponse = await axios.post(
              "http://localhost:3000/refresh-token",
              {
                refreshToken,
              }
            );

            // Update tokens
            localStorage.setItem(
              "Access_Token",
              refreshResponse.data.Access_Token
            );
            localStorage.setItem(
              "Refresh_Token",
              refreshResponse.data.Refresh_Token
            );

            // Retry the original request
            const retryResponse = await axios.post(
              "http://localhost:3000/sign-up/re-send",
              {
                email: userEmail,
              }
            );
            if (retryResponse.status === 201) {
              setErrorMessage(null);
              setSuccessMessage("Verification code resent successfully");
              showToast("Verification code resent", "info");
            }
          } catch (refreshError) {
            setSuccessMessage(null);
            setErrorMessage("Session expired. Please try registering again.");
            setOpenVerification(false);
            navigate("/register");
          }
        } else {
          setSuccessMessage(null);
          setErrorMessage(
            "Failed to resend verification code. Please try again."
          );
          showToast("Failed to resend verification code", "error");
        }
      }
    };

    await sendRequest();
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // Prevent closing the dialog via backdrop/ESC (replaces deprecated props)
  const handleDialogClose = (_event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    setOpenVerification(false);
  };

  return (
    <div className="login-container">
      <div className="background-image">
        <Container maxWidth="xs">
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: 3,
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              Register
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleRegister} style={{ width: "100%" }}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                name="email"
                type="text"
                value={formData.email}
                onChange={handleChange}
                required
                error={!!fieldErrors.email}
                helperText={fieldErrors.email || "Required field"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon
                        color={fieldErrors.email ? "error" : "action"}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                margin="normal"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                helperText={
                  fieldErrors.first_name ||
                  "Required field, letters only (no spaces)"
                }
                error={!!fieldErrors.first_name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupAddIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                margin="normal"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                helperText={
                  fieldErrors.last_name ||
                  "Required field, letters only (no spaces)"
                }
                error={!!fieldErrors.last_name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupAddIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                margin="normal"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                helperText={
                  fieldErrors.phone_number || "Required field (10 digits)"
                }
                error={!!fieldErrors.phone_number}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddIcCallIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                helperText={
                  fieldErrors.password ||
                  "Required field (minimum 8 characters)"
                }
                error={!!fieldErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm Password"
                variant="outlined"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                helperText={fieldErrors.confirmPassword || "Required field"}
                error={!!fieldErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Register
              </Button>
              <Button fullWidth variant="text" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </form>
          </Box>
        </Container>
      </div>

      <Dialog
        open={openVerification}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Email Verification</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please enter the 6-digit verification code sent to {userEmail}
          </Typography>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          <TextField
            label="Verification Code"
            variant="outlined"
            fullWidth
            value={verificationCode}
            onChange={(e) => {
              setErrorMessage(null);
              setSuccessMessage(null);

              const value = e.target.value.replace(/[^\d]/g, "");
              if (value.length <= 6) {
                setVerificationCode(value);
              }
            }}
            placeholder="Enter 6-digit code"
            inputProps={{
              maxLength: 6,
              pattern: "[0-9]*",
            }}
            error={!!errorMessage}
            helperText={errorMessage}
            autoFocus
          />
          <Button
            onClick={handleResendCode}
            color="primary"
            sx={{ mt: 2 }}
            disabled={!!errorMessage}
          >
            Resend Verification Code
          </Button>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenVerification(false);
              setErrorMessage(null);
              setVerificationCode("");
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerificationSubmit}
            color="primary"
            variant="contained"
            disabled={verificationCode.length !== 6}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Register;
