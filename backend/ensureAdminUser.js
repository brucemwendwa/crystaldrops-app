const bcrypt = require('bcrypt');
const User = require('./models/User');

/**
 * Ensures a demo admin account exists (local / memory DB).
 * Override with ADMIN_EMAIL and ADMIN_PASSWORD in .env
 */
async function ensureAdminUser() {
  if (process.env.DISABLE_ADMIN_SEED === '1') return;

  const email = (process.env.ADMIN_EMAIL || 'admin@crystaldrops.local').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'crystaldrops123';

  const existing = await User.findOne({ email });
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  if (existing) {
    let changed = false;
    if (!existing.isAdmin) {
      existing.isAdmin = true;
      changed = true;
    }
    if (process.env.ADMIN_RESET_PASSWORD === '1') {
      existing.password = hash;
      changed = true;
    }
    if (changed) {
      await existing.save();
      console.log(
        `[admin] Updated ${email}: isAdmin=true` +
          (process.env.ADMIN_RESET_PASSWORD === '1' ? '; password reset to ADMIN_PASSWORD.' : '.')
      );
    }
    return;
  }

  await User.create({ email, password: hash, isAdmin: true });
  console.log(`[admin] Created demo admin → email: ${email}  password: ${password}`);
}

module.exports = { ensureAdminUser };
