import nodemailer from "nodemailer";

const parseBooleanEnv = (value, defaultValue) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  return value === "true" || value === "1";
};

const buildTransportOptions = () => {
  const port =
    process.env.EMAIL_PORT && !Number.isNaN(Number(process.env.EMAIL_PORT))
      ? Number(process.env.EMAIL_PORT)
      : undefined;

  const secure = parseBooleanEnv(process.env.EMAIL_SECURE, port === 465);
  const rejectUnauthorized = parseBooleanEnv(
    process.env.EMAIL_TLS_REJECT_UNAUTHORIZED,
    true
  );

  const transportOptions = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: port || (secure ? 465 : 587),
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized,
    },
  };

  if (process.env.EMAIL_SERVICE) {
    transportOptions.service = process.env.EMAIL_SERVICE;
  }

  return transportOptions;
};

export const sendMail = async (email, tempUser) => {
  const transportOptions = buildTransportOptions();
  try {
    console.log("[sendMail] Creating transporter with options:", {
      ...transportOptions,
      auth: {
        user: transportOptions.auth?.user,
        pass: transportOptions.auth?.pass ? "***" : undefined,
      },
    });
    const transporter = nodemailer.createTransport(transportOptions);

    if (parseBooleanEnv(process.env.EMAIL_VERIFY, true)) {
      console.log("[sendMail] Verifying transporter credentials");
      await transporter.verify();
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Your Activation Code",
      text: `Your activation code is: ${tempUser.passcode}`,
      html: `<p>Your activation code is: <strong>${tempUser.passcode}</strong></p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[sendMail] Mail sent, message id:", info.messageId);
    return true;
  } catch (error) {
    console.error("[sendMail] error:", error);
    throw error;
  }
};
