const getForgotEmail = (name, email, resetHash) => {
  const uri = process.env.NODE_ENV === 'production' ? `` : `staging.`;

  const html = `<html lang="en">
  <head><meta charset="UTF-8"></head>
  <body style="font-family: Helvetica, serif;">
    <p>${name},</p>
    <p>Someone has requested a link to change your password. You can do this through the link below.</p>
    <a style="color: #3760e8;" href="https://${uri}aurorafest.org/reset/${resetHash}">Change my password.</a>
    <p>If you didn't request this, please ignore this email. Your password won't change until you access the link above and create a new one.</p>
    <br />
    Thanks,<br />
    Team Aurora
    <br /><br /><hr />
    <p style="font-size: 0.8em;">ABV-IIITM, Gwalior, Madhya Pradesh, 474015</p>
  </body>
</html>
`;
  const text = `
${name},

Someone has requested a link to change your password. You can do this through the link below.

https://${uri}aurorafest.org/reset/${resetHash}

If you didn't request this, please ignore this email. Your password won't change until you access the link above and create a new one.

Thanks,
Team Aurora

ABV-IIITM, Gwalior, Madhya Pradesh, 474015
`;

  return {
    html,
    text,
    to: email,
    from: 'Aurora <admin@aurorafest.org>',
    subject: 'Resetting your AuroraFest.org password',
  };
};

module.exports = getForgotEmail;
