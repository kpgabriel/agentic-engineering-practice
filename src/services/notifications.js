// TODO: replace with real email provider (SendGrid, SES, etc.)

/**
 * @description Logs and simulates sending an email.
 * @param {Object} message - The email to send.
 * @param {string} message.to - The recipient address.
 * @param {string} message.subject - The email subject.
 * @param {string} message.body - The email body.
 * @returns {Promise<{sent: boolean, to: string, subject: string}>} A promise resolving to the send result.
 */
function sendEmail({ to, subject, body }) {
  console.log('[EMAIL] Sending to:', to, '| Subject:', subject);
  return Promise.resolve({ sent: true, to, subject });
}

/**
 * @description Sends a welcome email to a newly created user.
 * @param {{name: string, email: string}} user - The user to welcome.
 * @returns {Promise<{sent: boolean, to: string, subject: string}>} A promise resolving to the send result.
 */
function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Taskr!',
    body: `Hi ${user.name}, your account is ready. Start managing your tasks at taskr.io.`
  });
}

module.exports = { sendEmail, sendWelcomeEmail };
