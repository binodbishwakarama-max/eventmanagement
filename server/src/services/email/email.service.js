import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const isProduction = env.NODE_ENV === 'production';

  if (env.EMAIL_PROVIDER === 'smtp' || (env.SMTP_HOST && env.SMTP_USER)) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
    console.log(`[Email] SMTP Transport initialized for ${env.SMTP_HOST}:${env.SMTP_PORT}`);
  } else {
    // Development or Mock Mode
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    if (!isProduction) {
      console.log('[Email] Operating in mock transport mode (development/test).');
    }
  }

  return transporter;
}

/**
 * Universal mail delivery wrapper
 */
async function sendMail({ to, subject, html, text }) {
  const isProduction = env.NODE_ENV === 'production';
  const mailOptions = {
    from: env.SMTP_FROM,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ' ')
  };

  try {
    const transport = getTransporter();
    const result = await transport.sendMail(mailOptions);
    
    if (!isProduction) {
      console.log(`[Email:Dev] Sent "${subject}" to ${to}`);
    } else {
      console.log(`[Email:Prod] Dispatched email to ${to} (MessageID: ${result.messageId || 'sent'})`);
    }

    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error(`[Email Error] Failed delivering email to ${to}: ${err.message}`);
    // Non-blocking in dev/test, but logged
    return { success: false, error: err.message };
  }
}

/**
 * 1. Password Reset Email
 * CRITICAL RULE: Never log password-reset links or tokens in production!
 */
export async function sendPasswordResetEmail({ to, studentName = 'DSU Student', resetUrl }) {
  const isProduction = env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log(`[Email:Dev:PasswordReset] Token/URL for ${to}: ${resetUrl}`);
  } else {
    // Strictly redact URL and token in production logs
    console.log(`[Email:Prod:PasswordReset] Security dispatch initiated for ${to}`);
  }

  const subject = 'Reset Your DSU Campus Events Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
      <div style="background-color: #002B55; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #FFFFFF; margin: 0; font-size: 20px;">Dayananda Sagar University</h2>
        <p style="color: #D9A521; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Campus Events Platform</p>
      </div>
      <p style="font-size: 15px; color: #1E293B;">Dear ${studentName},</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        We received a request to reset your password for your DSU Campus Events account. Click the button below to establish a new password. This link is valid for <strong>15 minutes</strong>.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #002B55; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 12px; color: #64748B; line-height: 1.5;">
        If you did not request a password reset, you can safely ignore this email. Your session remains secure.
      </p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #94A3B8; text-align: center;">
        Dayananda Sagar University • Devarakaggalahalli, Harohalli, Bengaluru – 562112<br />
        This is an automated institutional notification. Please do not reply directly.
      </p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

/**
 * 2. Event Registration Confirmation with QR Code & Ticket Pass Details
 */
export async function sendRegistrationConfirmationEmail({ to, studentName, event, ticketCode }) {
  const subject = `Pass Confirmed: ${event.title} | DSU Campus Events`;
  const formattedDate = new Date(event.startsAt).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = new Date(event.startsAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
      <div style="background-color: #002B55; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #FFFFFF; margin: 0; font-size: 20px;">Dayananda Sagar University</h2>
        <p style="color: #D9A521; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Official Campus Event Pass</p>
      </div>
      <p style="font-size: 15px; color: #1E293B;">Hello ${studentName},</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Your digital admission pass for <strong>${event.title}</strong> has been issued. Present this pass or ticket code at the venue gate for verification.
      </p>
      
      <div style="background-color: #F8FAFC; border: 2px dashed #002B55; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 11px; font-weight: bold; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Ticket Pass Code</span>
        <div style="font-size: 26px; font-family: monospace; font-weight: bold; color: #002B55; margin: 8px 0; letter-spacing: 2px;">
          ${ticketCode}
        </div>
        <p style="font-size: 12px; color: #64748B; margin: 0;">Unique Single-Use Pass Code</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 0; color: #64748B; width: 30%;"><strong>Event:</strong></td>
          <td style="padding: 8px 0; color: #0F172A;">${event.title}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748B;"><strong>Date:</strong></td>
          <td style="padding: 8px 0; color: #0F172A;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748B;"><strong>Time:</strong></td>
          <td style="padding: 8px 0; color: #0F172A;">${formattedTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748B;"><strong>Venue:</strong></td>
          <td style="padding: 8px 0; color: #0F172A;">${event.venue}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748B;"><strong>Organizer:</strong></td>
          <td style="padding: 8px 0; color: #0F172A;">${event.organizerClub || 'DSU Council'}</td>
        </tr>
      </table>

      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #94A3B8; text-align: center;">
        Dayananda Sagar University • Devarakaggalahalli, Harohalli, Bengaluru – 562112<br />
        To manage or review your registrations, visit your <a href="${env.CLIENT_ORIGIN}/dashboard" style="color: #002B55;">Student Passbook</a>.
      </p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

/**
 * 3. Event Cancellation Notification
 */
export async function sendEventCancellationEmail({ to, studentName, event, reason = 'Administrative cancellation' }) {
  const subject = `Cancelled: ${event.title} | DSU Campus Notice`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #FCA5A5; border-radius: 8px; background-color: #FEF2F2;">
      <div style="background-color: #991B1B; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #FFFFFF; margin: 0; font-size: 18px;">Event Cancellation Notice</h2>
        <p style="color: #FEE2E2; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Dayananda Sagar University</p>
      </div>
      <p style="font-size: 15px; color: #1E293B;">Dear ${studentName},</p>
      <p style="font-size: 14px; color: #374151; line-height: 1.6;">
        Please be advised that the campus event <strong>${event.title}</strong>, originally scheduled for <strong>${new Date(event.startsAt).toLocaleDateString('en-IN')}</strong> at <strong>${event.venue}</strong>, has been cancelled by the event organizers.
      </p>
      <div style="background-color: #FFFFFF; border-left: 4px solid #EF4444; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
        <strong style="color: #991B1B; font-size: 13px;">Reason / Details:</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #4B5563;">${reason}</p>
      </div>
      <p style="font-size: 13px; color: #4B5563;">
        Your digital pass has been deactivated. You can explore other upcoming university hackathons, workshops, and gatherings on the <a href="${env.CLIENT_ORIGIN}/events" style="color: #002B55; font-weight: bold;">DSU Campus Events Portal</a>.
      </p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

/**
 * 4. Event Update / Venue Change Notification
 */
export async function sendEventUpdateEmail({ to, studentName, event, changeSummary }) {
  const subject = `Update Notice: Changes to ${event.title} | DSU Campus Events`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
      <div style="background-color: #002B55; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #FFFFFF; margin: 0; font-size: 18px;">Important Event Update</h2>
        <p style="color: #D9A521; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Dayananda Sagar University</p>
      </div>
      <p style="font-size: 15px; color: #1E293B;">Hello ${studentName},</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        The schedule or venue details for <strong>${event.title}</strong> have been updated by the organizing faculty committee.
      </p>
      <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #1E3A8A; font-weight: 500;">
          ${changeSummary}
        </p>
      </div>
      <p style="font-size: 13px; color: #475569;">
        <strong>Updated Venue:</strong> ${event.venue}<br />
        <strong>Updated Start Time:</strong> ${new Date(event.startsAt).toLocaleString('en-IN')}
      </p>
      <p style="font-size: 12px; color: #64748B; margin-top: 24px;">
        Your existing ticket pass code remains valid.
      </p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

