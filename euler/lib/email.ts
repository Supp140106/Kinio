export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const nodemailer = await import("nodemailer")
  const transporter = nodemailer.default.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"Kineo" <${process.env.GMAIL_EMAIL}>`,
    to,
    subject,
    html,
  })
}
