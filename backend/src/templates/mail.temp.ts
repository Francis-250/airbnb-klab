export const welcomeEmail = (name: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #4a90e2;">
      <h1 style="color: #2c3e50; margin: 0;">Welcome</h1>
    </div>
    <div style="padding: 20px 0;">
      <p style="font-size: 16px; color: #34495e;">Dear <strong>${name}</strong>,</p>
      <p style="font-size: 16px; color: #34495e; line-height: 1.5;">Thank you for joining our platform. We're thrilled to have you as part of our community. Get ready to experience the best service tailored just for you.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #2c3e50;">Verify your email address to unlock all features</p>
        <p style="margin: 10px 0 0 0; color: #2c3e50;">Complete your profile for personalized recommendations</p>
      </div>
    </div>
    <div style="padding-top: 20px; text-align: center; border-top: 1px solid #e0e0e0; color: #7f8c8d; font-size: 12px;">
      <p>© 2024 Your Company Name. All rights reserved.</p>
    </div>
  </div>
`;

export const passwordResetEmail = (otp: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e74c3c;">
      <h1 style="color: #2c3e50; margin: 0;">Password Reset Request</h1>
    </div>
    <div style="padding: 20px 0;">
      <p style="font-size: 16px; color: #34495e;">Dear Valued User,</p>
      <p style="font-size: 16px; color: #34495e; line-height: 1.5;">We received a request to reset your password. Use the One-Time Password (OTP) below to complete the process.</p>
      <div style="background-color: #fef5e7; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 14px; color: #7f8c8d; margin: 0 0 10px 0;">Your OTP Code</p>
        <p style="font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 5px; margin: 0;">${otp}</p>
      </div>
      <p style="font-size: 14px; color: #e74c3c; margin-top: 20px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
      <p style="font-size: 14px; color: #7f8c8d;">If you did not request this password reset, please ignore this email or contact our support team.</p>
    </div>
    <div style="padding-top: 20px; text-align: center; border-top: 1px solid #e0e0e0; color: #7f8c8d; font-size: 12px;">
      <p> 2024 Your Company Name. All rights reserved.</p>
    </div>
  </div>
`;

export const bookingStatusEmail = (status: string, listingTitle?: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid ${status === "confirmed" ? "#27ae60" : "#e74c3c"};">
      <h1 style="color: #2c3e50; margin: 0;">Booking Status Update</h1>
    </div>
    <div style="padding: 20px 0;">
      <p style="font-size: 16px; color: #34495e;">Dear Guest,</p>
      <p style="font-size: 16px; color: #34495e; line-height: 1.5;">Your booking status has been updated. Below are the details:</p>
      ${
        listingTitle
          ? `<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #2c3e50;">${listingTitle}</p>
        <p style="margin: 5px 0; color: #34495e;">Status: <strong>${status.toUpperCase()}</strong></p>
      </div>`
          : `<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #2c3e50;">Status: <strong>${status.toUpperCase()}</strong></p>
      </div>`
      }
      <p style="font-size: 16px; color: #34495e;">Thank you for choosing our service. We appreciate your business.</p>
    </div>
    <div style="padding-top: 20px; text-align: center; border-top: 1px solid #e0e0e0; color: #7f8c8d; font-size: 12px;">
      <p> 2024 Your Company Name. All rights reserved.</p>
    </div>
  </div>
`;

export const bookingConfirmationEmail = (
  listingName: string,
  checkIn: string,
  checkOut: string,
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #27ae60;">
      <h1 style="color: #2c3e50; margin: 0;">Booking Confirmation</h1>
    </div>
    <div style="padding: 20px 0;">
      <p style="font-size: 16px; color: #34495e;">Dear Guest,</p>
      <p style="font-size: 16px; color: #34495e; line-height: 1.5;">Your booking has been confirmed. Below are your reservation details:</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #2c3e50;">${listingName}</p>
        <p style="margin: 5px 0; color: #34495e;">Check-in: <strong>${checkIn}</strong></p>
        <p style="margin: 5px 0; color: #34495e;">Check-out: <strong>${checkOut}</strong></p>
      </div>
      <p style="font-size: 16px; color: #34495e;">We look forward to hosting you. Should you have any questions, please don't hesitate to contact our support team.</p>
    </div>
    <div style="padding-top: 20px; text-align: center; border-top: 1px solid #e0e0e0; color: #7f8c8d; font-size: 12px;">
      <p>© 2024 Your Company Name. All rights reserved.</p>
    </div>
  </div>
`;
