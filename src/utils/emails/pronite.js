const getProniteEmail = (name, email, arId, receipt, amount) => {
  const html = `<html lang="en">
  <head>
    <meta charset="UTF-8">
  </head>
  <body style="font-family: Helvetica, serif;">
    <p>${name},</p>
    <p>You have succesfully availed the Pronite pass(es) for Aurora'20.</p>
    <p>
      <b>Order Summery:</b><br />
      <table style="width: 90%; margin-left: 5%; border: 1px solid black; border-collapse: collapse; text-align: center;">
        <thead>
          <tr>
            <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">AR-ID</th>
            <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Amount</th>
            <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Receipt ID</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${arId}</td>
            <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Rs. ${amount}</td>
            <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${receipt}</td>
          </tr>
        </tbody>
      </table>
    </p>
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

You have succesfully availed the Pronite pass(es) for Aurora'20.

Order summary:
AR-ID    - Amount - Receipt ID
${arId} - Rs. ${amount} - ${receipt}

Thanks,
Team Aurora

ABV-IIITM, Gwalior, Madhya Pradesh, 474015
`;

  return {
    html,
    text,
    to: email,
    from: 'Aurora <admin@aurorafest.org>',
    subject: 'Payment summary for Aurora 20 pronites',
  };
};

module.exports = getProniteEmail;
