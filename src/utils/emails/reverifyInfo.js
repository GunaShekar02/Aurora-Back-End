const getReverifyInfoEmail = (orderId, amount, email, ctx) => {
  const prefix = process.env.NODE_ENV === 'production' ? `` : `[STAGING] `;
  const html = `<html lang="en">
  <head><meta charset="UTF-8"></head>
  <body style="font-family: Helvetica, serif;">
    <p>Payment done by <b>${email}</b> for ${ctx}, but it is not verified.</p>
    <p>
      OrderID: <b>${orderId}</b><br />
      Amount: <b>${amount}</b>
    </p>
    <br /><br /><hr />
    <p style="font-size: 0.8em;">ABV-IIITM, Gwalior, Madhya Pradesh, 474015</p>
  </body>
</html>
`;
  const text = `
Payment done by <b>${email}</b> for ${ctx}, but it is not verified.

OrderID: ${orderId}
Amount: ${amount}

ABV-IIITM, Gwalior, Madhya Pradesh, 474015
`;

  return {
    html,
    text,
    to: 'prem@aurorafest.org, kushwaha@aurorafest.org, mallikarjun@aurorafest.com',
    cc: 'prmsrswt@gmail.com',
    from: 'Aurora <admin@aurorafest.org>',
    subject: `${prefix}Re-Verify Payment at AuroraFest.org`,
  };
};

module.exports = getReverifyInfoEmail;
