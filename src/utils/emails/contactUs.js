const getContactEmail = (name, email, message) => {
  const html = `<html>
  <body>
    <p>Name: ${name}</p>
    <p>Email: <a href="mailto:${email}">${email}</a></p>
    <p>Message:</p><br />
    <pre>
      ${message}
    </pre>
  </body>
</html>
`;
  const text = `Name: ${name}
Email: ${email}
Message:

${message}
`;
  return {
    html,
    text,
  };
};

module.exports = getContactEmail;
