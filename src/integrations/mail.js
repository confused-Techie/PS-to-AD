const nodemailer = require("nodemailer");

async function send(content, config) {
  try {
    let configOptions = {
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.from,
        pass: config.email.pass,
      },
    };

    let transporter = nodemailer.createTransport(configOptions);

    let info = await transporter.sendMail({
      from: config.email.from,
      to: config.app.toEmail,
      subject: "PS-2-AD",
      text: content,
    });

    console.log(`Email Message Sent: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl}`);

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = {
  send,
};
