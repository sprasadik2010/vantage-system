import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@vantageincome.com")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    def send_credentials_email(self, to_email: str, username: str, password: str, full_name: str) -> bool:
        """Send login credentials to user's email with activation info"""
        
        # Email content
        subject = "Your Vantage Income System Account Credentials - Awaiting Activation"
        
        # HTML Email template with activation info
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }}
                .credentials-box {{ background-color: white; border: 2px solid #d1d5db; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .activation-box {{ background-color: #fffbeb; border: 2px solid #fbbf24; padding: 20px; margin: 25px 0; border-radius: 8px; }}
                .info-box {{ background-color: #fef3c7; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0; }}
                .btn {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }}
                .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }}
                .step {{ display: flex; align-items: flex-start; margin-bottom: 20px; }}
                .step-number {{ background-color: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }}
                .important {{ color: #dc2626; font-weight: bold; }}
                .pending {{ color: #d97706; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Welcome to Vantage Income System!</h1>
                <p>Your account has been created - Activation Required</p>
            </div>
            
            <div class="content">
                <p>Dear <strong>{full_name}</strong>,</p>
                
                <p>Thank you for registering with Vantage Income System. Here are your login credentials:</p>
                
                <div class="credentials-box">
                    <h3 style="margin-top: 0; color: #374151;">Your Login Details:</h3>
                    <div style="margin: 15px 0; padding: 10px; background-color: #f3f4f6; border-radius: 5px;">
                        <strong>Username:</strong> {username}<br>
                        <strong>Password:</strong> {password}
                    </div>
                </div>
                
                <!-- Activation Required Section -->
                <div class="activation-box">
                    <h3 style="color: #92400e; margin-top: 0;">⚠️ ACCOUNT ACTIVATION REQUIRED</h3>
                    
                    <div class="step">
                        <div class="step-number">1</div>
                        <div>
                            <strong>Current Status:</strong> <span class="pending">PENDING ACTIVATION</span><br>
                            <small>Your account is created but not yet active</small>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">2</div>
                        <div>
                            <strong>What happens next:</strong><br>
                            • Superadmin will review and activate your account<br>
                            • You'll receive another email when activated<br>
                            • Only then you can login with above credentials
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">3</div>
                        <div>
                            <strong>Estimated Time:</strong><br>
                            • Typically within 24 hours<br>
                            • Contact support if longer than 48 hours
                        </div>
                    </div>
                </div>
                
                <div class="info-box">
                    <p class="important">🔒 SECURITY REMINDER:</p>
                    <ul>
                        <li>Keep your credentials confidential</li>
                        <li>Change password after first login</li>
                        <li>Never share login details with anyone</li>
                        <li>Save this email for future reference</li>
                    </ul>
                </div>
                
                <p><strong>Login URL (After Activation):</strong><br>
                <a href="{self.frontend_url}/login">{self.frontend_url}/login</a></p>
                
                <p><strong>Contact Support:</strong><br>
                Email: support@vantageincome.com</p>
                
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                    <p>© 2024 Vantage Income System. All rights reserved.</p>
                    <p style="font-size: 11px; color: #9ca3af;">
                        Note: Your login will work only after superadmin activates your account.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        Welcome to Vantage Income System!
        
        Dear {full_name},
        
        Your account has been successfully created.
        
        LOGIN CREDENTIALS:
        Username: {username}
        Password: {password}
        
        ⚠️ IMPORTANT: ACCOUNT ACTIVATION REQUIRED
        
        Your account is currently INACTIVE and requires superadmin approval.
        
        What to expect:
        1. Your account is created but not yet active
        2. Superadmin will review and activate your account
        3. You'll receive another email when activated
        4. Only then you can login with above credentials
        
        Estimated activation time: Within 24 hours
        
        🔒 SECURITY REMINDER:
        - Keep credentials confidential
        - Change password after first login
        - Never share login details
        
        Login URL (After Activation): {self.frontend_url}/login
        
        Contact Support: support@vantageincome.com
        
        This is an automated message, please do not reply.
        
        © 2024 Vantage Income System. All rights reserved.
        
        Note: Login works only after superadmin activates your account.
        """
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"Vantage Income System <{self.from_email}>"
            msg['To'] = to_email
            
            # Attach both plain text and HTML versions
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            print(f"Credentials email with activation info sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")
            return False