const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification - University Hostel Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">University Hostel Management System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${name},</h2>
            <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for registering with the University Hostel Management System. To complete your registration, 
              please verify your email address using the 6-digit verification code below:
            </p>
            
            <div style="background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your Verification Code:</p>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 10px 0;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
              This code will expire in 15 minutes. If you didn't request this verification, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            <p>&copy; 2024 University Hostel Management System. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to University Hostel Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">University Hostel Management System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome Aboard!</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Welcome ${name}!</h2>
            <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
              Your email has been successfully verified and your account is now active. 
              You can now log in to the University Hostel Management System and start using our services.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Login to Your Account
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
              If you have any questions, please contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            <p>&copy; 2024 University Hostel Management System. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};
