const getInfoEvtEmail = (arId, name, email, evtName, amount, teamId) => {
  const prefix = process.env.NODE_ENV === 'production' ? `` : `[STAGING] `;
  const html = `<html lang="en">
  <head><meta charset="UTF-8"></head>
  <body style="font-family: Helvetica, serif;">
    <p>Payment done by <b>${name}</b> (${arId} - ${email}) for event <b>${evtName}</b>.</p>
    <p>
      <b>Order Summery:</b><br />
      <table style="width: 90%; margin-left: 5%; border: 1px solid black; border-collapse: collapse; text-align: center;">
        <thead>
          <tr>
            <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Event Name</th>
            <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Amount</th>
            <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Team ID</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${evtName}</td>
            <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Rs. ${amount}</td>
            <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${teamId}</td>
          </tr>
        </tbody>
      </table>
    </p>
    <br /><br /><hr />
    <p style="font-size: 0.8em;">ABV-IIITM, Gwalior, Madhya Pradesh, 474015</p>
  </body>
</html>
`;
  const text = `
  Payment done by ${name} (${arId} - ${email}) for event ${evtName}.

  Order summary:
  Event Name    - Amount - Team ID
  ${evtName} - Rs. ${amount} - ${teamId}

ABV-IIITM, Gwalior, Madhya Pradesh, 474015
`;

  return {
    html,
    text,
    to: 'prem@aurorafest.org, kushwaha@aurorafest.org',
    from: 'Aurora <admin@aurorafest.org>',
    subject: `${prefix}Event (${evtName}) Payment at AuroraFest.org`,
  };
};

module.exports = getInfoEvtEmail;
