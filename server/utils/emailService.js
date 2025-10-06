import nodemailer from 'nodemailer';

let transporter = null;

// Lazy initialization - only create transporter when actually sending email
const getTransporter = () => {
  if (transporter) return transporter;

  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASS = process.env.EMAIL_PASS;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not configured');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  console.log('✅ Email transporter initialized');
  return transporter;
};

// Send email function
export const sendEmail = async (to, subject, html) => {
  const transporter = getTransporter();
  
  if (!transporter) {
    console.error('❌ Cannot send email: Email service not configured');
    return null; // Don't throw, just return null
  }

  try {
    const mailOptions = {
      from: `"AEGIS Esports" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    // Don't throw - just log and return null so the main operation continues
    return null;
  }
};

// Email templates
export const emailTemplates = {
  teamInvitation: (playerName, teamName, tournamentName, organizerName) => ({
    subject: `Team Invitation from ${teamName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Team Invitation</h2>
        <p>Hi ${playerName},</p>
        <p>You have been invited to join <strong>${teamName}</strong>${
          tournamentName ? ` for the tournament <strong>${tournamentName}</strong>` : ''
        }${organizerName ? ` organized by <strong>${organizerName}</strong>` : ''}.</p>
        <p>Please log in to your AEGIS account to accept or decline this invitation.</p>
        <p>Best regards,<br>AEGIS Esports Team</p>
      </div>
    `,
  }),

  tournamentRegistration: (playerName, teamName, tournamentName) => ({
    subject: `Tournament Registration Confirmed: ${tournamentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Tournament Registration Confirmed</h2>
        <p>Hi ${playerName},</p>
        <p>Your team <strong>${teamName}</strong> has successfully registered for <strong>${tournamentName}</strong>.</p>
        <p>You will receive updates about match schedules and tournament progress.</p>
        <p>Best regards,<br>AEGIS Esports Team</p>
      </div>
    `,
  }),

  matchScheduled: (playerName, teamName, tournamentName, matchDetails) => ({
    subject: `Match Scheduled: ${tournamentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Match Scheduled</h2>
        <p>Hi ${playerName},</p>
        <p>Your team <strong>${teamName}</strong> has a match scheduled in <strong>${tournamentName}</strong>.</p>
        <p><strong>Match Details:</strong></p>
        <ul>
          <li>Match Number: ${matchDetails.matchNumber}</li>
          <li>Phase: ${matchDetails.phase}</li>
          <li>Scheduled Time: ${matchDetails.scheduledTime}</li>
          <li>Map: ${matchDetails.map}</li>
        </ul>
        <p>Please be ready for your match.</p>
        <p>Best regards,<br>AEGIS Esports Team</p>
      </div>
    `,
  }),
};

export default { sendEmail, emailTemplates };