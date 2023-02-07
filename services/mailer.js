const sgMail = require("@sendgrid/mail");
SG_KEY="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"

sgMail.setApiKey(SG_KEY);

const sendSGMail = async ({
  to,
  sender,
  subject,
  html,
  attachments,
  text,
}) => {
  try {
    const from = "prevailayodele432@gmail.com";

    const msg = {
      to: to, // Change to your recipient
      from: from, // Change to your verified sender
      subject: subject,
      html: html,
      // text: text,
      attachments,
    };
   
    console.log(true)
    return await sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
  } catch (error) {
    console.log(error);
  }
};

exports.sendEmail = async (args) => {
  if (!process.env.NODE_ENV === "development") {
    return await Promise.resolve();
  } else {
    return await sendSGMail(args);
  }
};
