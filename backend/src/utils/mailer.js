const { Resend } = require('resend');

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailOTP = async (email, otp) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured in the environment variables.');
  }

  // Resend requires a verified domain to send emails to arbitrary addresses.
  // For testing purposes on an unverified domain, Resend requires the "from" address
  // to be exactly "onboarding@resend.dev", and it will ONLY send emails to the specific 
  // email address associated with your Resend account.
  // If you have a verified domain, you can set RESEND_FROM_EMAIL (e.g., 'KisanSetu <noreply@kisansetu.com>').
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'KisanSetu Auth <onboarding@resend.dev>';

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'KisanSetu - Your Login OTP',
      text: `Your OTP for KisanSetu login is: ${otp}\n\nIt expires in 10 minutes.`,
      html: `<h2>KisanSetu</h2><p>Your OTP for KisanSetu login is: <b style="font-size: 24px;">${otp}</b></p><p>It expires in 10 minutes.</p>`,
    });

    if (error) {
      console.error(`[Mailer] Resend API Error:`, error);
      throw new Error(error.message || 'Failed to send email via Resend');
    }

    console.log(`[Mailer] Resend OTP email dispatched successfully to ${email}`);
    
    return data;
  } catch (err) {
    console.error(`[Mailer] Exception sending OTP email via Resend:`, err.message);
    throw err;
  }
};

module.exports = { sendEmailOTP };
