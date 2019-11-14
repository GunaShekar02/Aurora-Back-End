const getContactEmail = (name, email, subject, message) => {
  const html = `<html>
  <body>
    <p>Name: ${name}</p>
    <p>Email: <a href="mailto:${email}">${email}</a></p>
    <p>Subject: ${subject}</p>
    <p>Message:</p><br />
    <pre>
      ${message}
    </pre>
  </body>
</html>
`;
  const text = `Name: ${name}
Email: ${email}
Subject: ${subject}
Message:

${message}
`;
  return {
    html,
    text,
  };
};

module.exports = getContactEmail;
