const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Golf Charity Platform" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Email error: ${err.message}`);
  }
};

const welcomeEmail = (user) => ({
  to: user.email,
  subject: '🏌️ Welcome to Golf Charity Platform!',
  html: `<div style="font-family:Inter,sans-serif;background:#050a1a;color:#fff;padding:40px;border-radius:12px;max-width:600px">
    <h1 style="color:#00d4a0">Welcome, ${user.fullName}! 🎉</h1>
    <p>You've joined a platform where every swing counts — for you and for charity.</p>
    <p>Start by entering your scores and selecting a charity you care about.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" style="background:#00d4a0;color:#050a1a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px">Go to Dashboard →</a>
    <p style="color:#888;margin-top:32px;font-size:12px">Golf Charity Platform · Making Every Stroke Count</p>
  </div>`,
});

const subscriptionConfirmedEmail = (user, plan) => ({
  to: user.email,
  subject: '✅ Subscription Confirmed!',
  html: `<div style="font-family:Inter,sans-serif;background:#050a1a;color:#fff;padding:40px;border-radius:12px;max-width:600px">
    <h1 style="color:#00d4a0">You're In! 🏆</h1>
    <p>Your <strong>${plan}</strong> subscription is now active. You're entered into next month's draw.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" style="background:#00d4a0;color:#050a1a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px">View Dashboard →</a>
  </div>`,
});

const drawResultEmail = (user, draw, entry) => ({
  to: user.email,
  subject: `🎰 Draw Results — ${new Date(draw.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`,
  html: `<div style="font-family:Inter,sans-serif;background:#050a1a;color:#fff;padding:40px;border-radius:12px;max-width:600px">
    <h1 style="color:#f5c842">Monthly Draw Results! 🎯</h1>
    <p>Winning Numbers: <strong style="color:#00d4a0;font-size:20px">${draw.winningNumbers.join(' · ')}</strong></p>
    <p>Your Numbers: <strong>${entry.entryNumbers.join(' · ')}</strong></p>
    <p>Matches: <strong style="color:${entry.matchCount >= 3 ? '#00d4a0' : '#fff'}">${entry.matchCount} match${entry.matchCount !== 1 ? 'es' : ''}</strong></p>
    ${entry.tier ? `<p style="font-size:18px;color:#f5c842">🏆 Congratulations! You won the <strong>${entry.tier}</strong> prize!</p>` : '<p>Keep playing — jackpot grows every month!</p>'}
    <a href="${process.env.CLIENT_URL}/dashboard/draws" style="background:#00d4a0;color:#050a1a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px">View Results →</a>
  </div>`,
});

const winnerNotificationEmail = (user, entry) => ({
  to: user.email,
  subject: '🏆 You Won! Upload Your Proof',
  html: `<div style="font-family:Inter,sans-serif;background:#050a1a;color:#fff;padding:40px;border-radius:12px;max-width:600px">
    <h1 style="color:#f5c842">You're a Winner! 🎉</h1>
    <p>Your <strong>${entry.tier}</strong> prize of <strong style="color:#00d4a0">$${entry.prizePayout}</strong> is waiting!</p>
    <p>Please upload a screenshot of your score card to claim your prize.</p>
    <a href="${process.env.CLIENT_URL}/dashboard/winners/verify" style="background:#f5c842;color:#050a1a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px">Claim Prize →</a>
  </div>`,
});

module.exports = { sendEmail, welcomeEmail, subscriptionConfirmedEmail, drawResultEmail, winnerNotificationEmail };
