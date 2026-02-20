import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: "signup" | "forgot-password",
) {
  const subject =
    purpose === "signup"
      ? "Verify your email — Spot"
      : "Reset your password — Spot";

  const heading =
    purpose === "signup" ? "Email Verification" : "Password Reset";

  const message =
    purpose === "signup"
      ? "Thanks for signing up! Use this code to verify your email:"
      : "Use this code to reset your password:";

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f8fafc; border-radius: 16px; padding: 40px 32px; text-align: center;">
      <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 10px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #fff; font-size: 20px; font-weight: bold;">◆</span>
      </div>
      <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 22px;">${heading}</h2>
      <p style="color: #64748b; font-size: 15px; margin: 0 0 28px;">${message}</p>
      <div style="background: #fff; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px; margin: 0 0 28px;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2563eb;">${otp}</span>
      </div>
      <p style="color: #94a3b8; font-size: 13px; margin: 0;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Spot Events" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
}
