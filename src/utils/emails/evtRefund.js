const getEvtRefundEmail = (name, email, amount) => {
  const html = `<html lang="en">
  <head><meta charset="UTF-8"></head>
  <body style="font-family: Helvetica, serif;">
    <p>${name},</p>
    <p>As you have registered for an eligible event, we are issuing you a refund of Rs. ${amount}.</p>
    <p>Please contact support if you any problems regarding the refund.</p>
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

As you have registered for an eligible event, we are issuing you a refund of Rs. ${amount}.

Please contact support if you any problems regarding the refund.

Thanks,
Team Aurora

ABV-IIITM, Gwalior, Madhya Pradesh, 474015
`;

  return {
    html,
    text,
    to: email,
    from: 'Aurora <admin@aurorafest.org>',
    subject: 'Refund for Aurora pronite',
  };
};

module.exports = getEvtRefundEmail;
