const getAlphaEmail = (name, email, password) => {
  const uri = process.env.NODE_ENV === 'production' ? `` : `staging.`;

  const html = `<html lang="en">
  <head><meta charset="UTF-8"></head>
  <body style="font-family: Helvetica, serif;">
    <p>${name},</p>
    <p>You have successfully registered for Aurora 20. You can login at <a style="color: #3760e8;" href="https://${uri}aurorafest.org/login">aurorafest.org</a> using your email and the password specified below.</p>
    <p>Password: <code>${password}</code></p>
    <br />
    Thanks,<br />
    Team Aurora
    <br /><br /><hr />
    <p style="font-size: 0.8em;">ABV-IIITM, Gwalior, Madhya Pradesh, 474015</p>
  </body>
</html>
`;
  const text = `${name},

You have successfully registered for Aurora 20. You can login at https://${uri}aurorafest.org/login using your email and the password specified below.

Password: ${password}

Thanks,
Team Aurora

ABV-IIITM, Gwalior, Madhya Pradesh, 474015
`;

  return {
    html,
    text,
    to: email,
    from: 'Aurora <admin@aurorafest.org>',
    subject: 'Registration successful at AuroraFest.org',
  };
};

module.exports = getAlphaEmail;
