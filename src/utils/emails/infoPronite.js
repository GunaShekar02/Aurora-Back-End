const getInfoProEmail = (arId, name, email, orderId, amount) => {
  const prefix = process.env.NODE_ENV === 'production' ? `` : `[STAGING] `;
  const html = `<html lang="en">
  <head><meta charset="UTF-8"></head>
  <body style="font-family: Helvetica, serif;">
    <p>Payment done by <b>${name}</b> (${arId} - ${email}) for pronite.</p>
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
Payment done by ${name} (${arId} - ${email}) for pronite.

OrderID: ${orderId}
Amount: ${amount}

ABV-IIITM, Gwalior, Madhya Pradesh, 474015
`;

  return {
    html,
    text,
    to: 'prem@aurorafest.org, kushwaha@aurorafest.org',
    from: 'Aurora <admin@aurorafest.org>',
    subject: `${prefix}Pronite Payment at AuroraFest.org`,
  };
};

module.exports = getInfoProEmail;
