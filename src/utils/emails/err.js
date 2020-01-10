const getErrEmail = (title, error) => {
  const html = `<html lang="en">
  <meta charset="UTF-8">
  <body style="font-family: Helvetica, serif;">
    <p><b>${title}</b></p>
    <p><pre><code>${error}</code></pre></p>
    <br /><br /><hr />
    <p style="font-size: 0.8em;">ABV-IIITM, Gwalior, Madhya Pradesh, 474015</p>
  </body>
</html>
`;
  const text = `
${title}

${error}

ABV-IIITM, Gwalior, Madhya Pradesh, 474015
`;

  return {
    html,
    text,
    to: 'prem@aurorafest.org, kushwaha@aurorafest.org',
    cc: 'prmsrswt@gmail.com',
    from: 'Aurora <admin@aurorafest.org>',
    subject: 'Error at AuroraFest.org',
  };
};

module.exports = getErrEmail;
