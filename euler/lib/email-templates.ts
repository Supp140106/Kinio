function baseHtml({
  content,
}: {
  content: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Kineo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f5; min-width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="480"><tr><td><![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px;">
          <tr>
            <td style="padding: 40px 32px 0; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="width: 40px; height: 40px; background-color: #7c3aed; border-radius: 10px;">
                <tr>
                  <td align="center" valign="middle" style="font-size: 18px; font-weight: 700; color: #ffffff; line-height: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    K
                  </td>
                </tr>
              </table>
              <p style="margin: 12px 0 0; font-size: 16px; font-weight: 600; color: #18181b; letter-spacing: -0.01em;">
                Kineo
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="height: 1px; background-color: #e4e4e7;">
                <tr>
                  <td style="height: 1px; line-height: 1px; font-size: 1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          ${content}
          <tr>
            <td style="padding: 4px 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="height: 1px; background-color: #e4e4e7;">
                <tr>
                  <td style="height: 1px; line-height: 1px; font-size: 1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Kineo. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buttonHtml({ url, label }: { url: string; label: string }) {
  return `<!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="10" strokecolor="#7c3aed" fillcolor="#7c3aed">
    <w:anchorlock/>
    <center style="color:#ffffff;font-size:14px;font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      ${label}
    </center>
  </v:roundrect>
<![endif]-->
<!--[if !mso]><!-- -->
  <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 32px; background-color: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box;">
    ${label}
  </a>
<!--<![endif]-->`
}

export function verificationEmailHtml({
  url,
  userName,
}: {
  url: string
  userName?: string
}) {
  return baseHtml({
    content: `
      <tr>
        <td style="padding: 24px 32px 0; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #18181b; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Verify your email
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 32px 0; text-align: center;">
          <p style="margin: 0; font-size: 15px; color: #52525b; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${userName ? `Hi ${userName},<br>` : ''}
            Thanks for signing up. Please confirm your email address to get started.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 28px 32px 0;">
          ${buttonHtml({ url, label: "Verify email" })}
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 32px 0; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </td>
      </tr>
    `,
  })
}

export function resetPasswordEmailHtml({
  url,
  userName,
}: {
  url: string
  userName?: string
}) {
  return baseHtml({
    content: `
      <tr>
        <td style="padding: 24px 32px 0; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #18181b; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Reset your password
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 32px 0; text-align: center;">
          <p style="margin: 0; font-size: 15px; color: #52525b; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${userName ? `Hi ${userName},<br>` : ''}
            We received a request to reset your password. Click the button below to set a new one.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 28px 32px 0;">
          ${buttonHtml({ url, label: "Reset password" })}
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 32px 0; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
    `,
  })
}

export function signInEmailHtml({ url }: { url: string }) {
  return baseHtml({
    content: `
      <tr>
        <td style="padding: 24px 32px 0; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #18181b; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Sign in to Kineo
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 32px 0; text-align: center;">
          <p style="margin: 0; font-size: 15px; color: #52525b; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Click the button below to sign in to your account.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 28px 32px 0;">
          ${buttonHtml({ url, label: "Sign in" })}
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 32px 0; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
    `,
  })
}
