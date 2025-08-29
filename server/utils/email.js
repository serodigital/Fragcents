import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,       // SSL port
    secure: true,    // use SSL
    auth: {
      user: "sphakhumalo610@gmail.com",
      pass: "hjsevrzeqooysjrh", // your Gmail App Password
    },
    tls: {
      rejectUnauthorized: false, // <-- ignore self-signed certificate (dev only)
    },
  });

  await transporter.sendMail({
    from: "sphakhumalo610@gmail.com",
    to,
    subject,
    text,
  });
};
