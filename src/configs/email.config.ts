import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const generateOTPEmailContent = (otp: string): string => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center;">
        <h2 style="background: #d32f2f; color: white; padding: 15px; border-radius: 8px;">🚨 RAS - Rescue Assistance System 🚨</h2>
        <p style="font-size: 18px;">Dear User,</p>
        <p style="font-size: 16px;">Your OTP code for accessing the RAS system is:</p>
        <h3 style="color: #FF5733; font-size: 24px; background: #f8d7da; display: inline-block; padding: 10px 20px; border-radius: 5px;">${otp}</h3>
        <p style="font-size: 14px;">This code will expire in <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">Best regards,<br><strong>RAS Team</strong></p>
    </div>
`

export const generateOTPVerifyDevice = (otp: string): string => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center;">
        <h2 style="background: #d32f2f; color: white; padding: 15px; border-radius: 8px;">🚨 RAS - Rescue Assistance System 🚨</h2>
        <h3 style="color:rgb(247, 14, 14);">🔄 Change New Device</h3>
        <p style="font-size: 18px;">Dear User,</p>
        <p style="font-size: 16px;">Your OTP code for accessing the RAS system with your new device is:</p>
        <h3 style="color: #FF5733; font-size: 24px; background: #f8d7da; display: inline-block; padding: 10px 20px; border-radius: 5px;">${otp}</h3>
        <p style="font-size: 14px;">This code will expire in <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">Best regards,<br><strong>RAS Team</strong></p>
    </div>
`
export const generateOTPForgotPassword = (otp: string): string => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center;">
        <h2 style="background: #d32f2f; color: white; padding: 15px; border-radius: 8px;">🚨 RAS - Rescue Assistance System 🚨</h2>
        <h3 style="color:rgb(247, 14, 14);">Forgot Password</h3>
        <p style="font-size: 18px;">Dear User,</p>
        <p style="font-size: 16px;">Your OTP code for accessing the RAS system to change password:</p>
        <h3 style="color: #FF5733; font-size: 24px; background: #f8d7da; display: inline-block; padding: 10px 20px; border-radius: 5px;">${otp}</h3>
        <p style="font-size: 14px;">This code will expire in <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">Best regards,<br><strong>RAS Team</strong></p>
    </div>
`

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
    try {
        const mailOptions = {
            from: `"RAS System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent
        }

        await transporter.sendMail(mailOptions)
        console.log(`Email sent to ${to} with subject: ${subject}`)
        return true
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

export default transporter
