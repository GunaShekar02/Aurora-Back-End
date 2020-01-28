const getEvtEmail = (name, email, event, receipt, amount) => {
  const html = `<html lang="en">
  <head>
    <meta charset="UTF-8">
  </head>
  <body style="font-family: Helvetica, serif;">
    <p>${name},</p>
    <p>You have successfully registered for the event <b>${event}</b> at Aurora'20, ABV-IIITM Gwalior.</p>
    <p>
      <b>Order Summery:</b><br />
      <table style="width: 90%; margin-left: 5%; border: 1px solid black; border-collapse: collapse; text-align: center;">
        <thead>
          <tr>
            <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Event Name</th>
            <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Amount</th>
            <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Receipt ID</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${event}</td>
            <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Rs. ${amount}</td>
            <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${receipt}</td>
          </tr>
        </tbody>
      </table>
    </p>
    <br />
    <p>Hope to see you at Aurora, 14th - 16th Feb, 2020.</p>
    Thanks,<br />
    Team Aurora
    <br /><br /><hr />
    <p style="font-size: 0.8em;">ABV-IIITM, Gwalior, Madhya Pradesh, 474015</p>
  </body>
</html>
`;
  const text = `
${name},

You have successfully registered for the event ${event} at Aurora'20.

Order summary:
Event Name    - Amount - Receipt ID
${event} - Rs. ${amount} - ${receipt}

Hope to see you at Aurora, 14th - 16th Feb, 2020.

Thanks,
Team Aurora

ABV-IIITM, Gwalior, Madhya Pradesh, 474015
`;

  return {
    html,
    text,
    to: email,
    from: 'Aurora <admin@aurorafest.org>',
    subject: 'Registration confirmation for Aurora, IIIT Gwalior',
  };
};

module.exports = getEvtEmail;
