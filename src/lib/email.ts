import { Resend } from 'resend'

const FROM_EMAIL = 'WurldBasket <noreply@wurldbasket.com>'

// Lazy initialization of Resend client
let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  type: 'signup' | 'password-reset'
): Promise<{ success: boolean; error?: string }> {
  const subject =
    type === 'signup'
      ? 'Verify your WurldBasket account'
      : 'Reset your WurldBasket password'

  const heading =
    type === 'signup'
      ? 'Welcome to WurldBasket!'
      : 'Password Reset Request'

  const message =
    type === 'signup'
      ? 'Use the code below to verify your email address and complete your registration.'
      : 'Use the code below to reset your password. If you did not request this, please ignore this email.'

  try {
    const client = getResendClient()
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <img src="https://wurldbasket.com/WurldBAsketLogo.png" alt="WurldBasket" style="height: 60px; width: auto;">
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 20px;">
                      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1a1a1a; text-align: center;">
                        ${heading}
                      </h1>
                      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #666666; text-align: center;">
                        ${message}
                      </p>
                    </td>
                  </tr>
                  <!-- Code Box -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #666666;">Your verification code</p>
                        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #16a34a; letter-spacing: 8px;">
                          ${code}
                        </p>
                      </div>
                    </td>
                  </tr>
                  <!-- Expiry Notice -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <p style="margin: 0; font-size: 14px; color: #999999; text-align: center;">
                        This code will expire in 15 minutes.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px 30px; border-top: 1px solid #eee;">
                      <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                        If you didn't request this email, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
                <!-- Legal Footer -->
                <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse; margin-top: 20px;">
                  <tr>
                    <td style="text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        WurldBasket - Global Food Marketplace
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendLowStockEmail(
  toEmail: string,
  productName: string,
  currentStock: number,
  lowStockAlert: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResendClient()
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Low stock alert: ${productName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 480px; border-collapse: collapse; background: #fff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <img src="https://wurldbasket.com/WurldBAsketLogo.png" alt="WurldBasket" style="height: 60px; width: auto;">
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px 20px;">
                      <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #1a1a1a;">Low stock alert</h1>
                      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #444;">
                        <strong>${productName}</strong> has reached your low stock threshold.
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #444;">
                        Current stock: <strong>${currentStock}</strong><br>
                        Your alert threshold: <strong>${lowStockAlert}</strong>
                      </p>
                      <p style="margin: 16px 0 0; font-size: 14px; color: #666;">
                        Restock soon so customers can keep ordering. If stock reaches zero, this product will be hidden from the store until you add stock.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 30px; border-top: 1px solid #eee;">
                      <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">WurldBasket – Vendor notifications</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })
    if (error) {
      console.error('Low stock email error:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error('Low stock email service error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
