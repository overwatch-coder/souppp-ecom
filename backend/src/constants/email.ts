// email content for email verification code
export const getVerificationCodeEmailContent = (
  code: string,
  name: string = "User",
  type: string
) => {
  const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            .header h1 {
                color: #333;
            }
            .brand {
                color: "#FB7806"
            }
            .verification-code {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                text-align: center;
                margin-bottom: 20px;
            }
            .message {
                margin-bottom: 20px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Account Verification | <span class="brand">Souppp</span></h1>
            </div>
            <div class="verification-code">
                Your Verification Code: <span>${code}</span>
            </div>
            <div class="message">
                <p>Dear ${name},</p>
                <p>Thank you for using Souppp Ordering Services. To complete the ${type} process, please use the following verification code:</p>
                <p>This code is valid for only 10 minutes. If you did not request this code, please disregard this message.</p>
            </div>
            <div class="footer">
                <p>Best regards,</p>
                <p>The Souppp Team</p>
            </div>
        </div>
    </body>
    </html>
    `;

  return content;
};

// email content for user email verification confirmation
export const getVerificationSuccessEmailContent = (name: string = "User") => {
  const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Confirmation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            .header h1 {
                color: #333;
            }
            .message {
                margin-bottom: 20px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Account Confirmation</h1>
            </div>
            <div class="message">
                <p>Dear ${name},</p>
                <p>Congratulations! Your account has been successfully verified. You are now a confirmed member of our service.</p>
                <p>Thank you for joining us!</p>
            </div>
            <div class="footer">
                <p>Best regards,</p>
                <p>The Souppp Team</p>
            </div>
        </div>
    </body>
    </html>
    `;

  return content;
};

// email content for delete user confirmation
export const getDeletedUserEmailContent = (name: string = "User") => {
  const content = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Deletion Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .header h1 {
                  color: #333;
                }
                p {
                    margin-bottom: 10px;
                }
                .signature {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
              <div class="header">
                <h1>Account Deletion Confirmation</h1>
              </div>
              <p>Dear ${name},</p>
              <p>We are sorry to see you go and would like to confirm that your account has been successfully deleted.</p>
              <p>If there's anything we could have done better or if you have any feedback, please don't hesitate to let us know.</p>
              <p>We sincerely hope to see you again in the future.</p>
              <p>Best regards,</p>
              <p class="signature">The Souppp Team</p>
            </div>
        </body>
    </html>
    `;

  return content;
};

// email content for forgot-password
export const getForgotPasswordEmailContent = (
  name: string = "User",
  link: string
) => {
  const content = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Reset Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
            color: #333;
        }
        p {
          margin-bottom: 10px;
        }
        .verification-link {
          margin-top: 10px;
          font-weight: bold;
        }
        .note {
          font-style: italic;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <p>Dear ${name},</p>
        <p>You have requested to reset your password. Please click the link below to proceed:</p>
        <p class="verification-link"><a href=${link}>Reset Password</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p class="note">
          Note: The verification code is valid for 10 minutes and can only be
          used once.
        </p>
        <p>Thank you.</p>
        <p class="signature">The Souppp Team</p>
      </div>
    </body>
  </html>
  
    `;

  return content;
};

// email content for reset-password confirmation
export const getResetPasswordConfirmationEmailContent = (
  name: string = "User"
) => {
  const content = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
              color: #333;
          }
          p {
            margin-bottom: 10px;
          }
          .note {
            font-style: italic;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Confirmation</h1>
          </div>
          <p>Dear ${name},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you initiated this action, you can disregard this email.</p>
          <p>If you didn't request this change, please contact us immediately.</p>
          <p class="note">
            Note: For security reasons, it is recommended to change delete all previously saved passwords.
          </p>
          <p>Thank you.</p>
          <p class="signature">The Souppp Team</p>
        </div>
      </body>
    </html>    
    `;

  return content;
};

// email content for order confirmation
export const getOrderConfirmationEmailContent = (
  orderId: string,
  totalPrice: number,
  name: string = "User"
) => {
  const content = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Order Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #333;
        }
        p {
          margin-bottom: 10px;
        }
        .order-details {
          background-color: #fff;
          padding: 20px;
          border-radius: 5px;
          margin-top: 20px;
        }
        .order-id {
          font-weight: bold;
        }
        .user-name {
          font-style: italic;
        }
        .total-price {
          font-weight: bold;
          font-size: 18px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <p>Dear <span class="user-name">Dear ${name}</span>,</p>
        <p>
          Your order with Order ID: <span class="order-id">${orderId}</span> has
          been successfully placed.
        </p>
        <div class="order-details">
          <p><strong>Order Details:</strong></p>
          <p>Total Price: <span class="total-price">$${totalPrice}</span></p>
        </div>
        <p>Thank you for shopping with us!</p>
        <p class="footer">This is an automated email, please do not reply.</p>
      </div>
    </body>
  </html>
    `;

  return content;
};

// email content for order status change
export const getOrderStatusChangeEmailContent = (
  orderId: string,
  name: string = "User",
  orderStatus: string
) => {
  const content = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Update</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .header h1 {
        color: #333;
      }
      p {
        margin: 10px 0;
        color: #555;
      }
      .order-details {
        background-color: #fff;
        padding: 20px;
        border-radius: 5px;
        margin-top: 20px;
      }
      .order-id {
        font-weight: bold;
      }
      .order-status {
        font-style: italic;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Order Update</h1>
      </div>
      <p>Dear ${name},</p>
      <p>We're writing to inform you about an update regarding your order with Order ID: <span class="order-id">${orderId}</span>.</p>
      <div class="order-details">
        <p><strong>Order Status Update:</strong></p>
        <p>Your order status has been updated to: <span class="order-status">${orderStatus}</span></p>
      </div>
      <p>If you have any questions or concerns, please feel free to contact our customer support.</p>
      <p>Thank you for shopping with us!</p>
      <p class="footer">This is an automated email, please do not reply.</p>
    </div>
  </body>
  </html>  
  `;
  return content;
};

// email content for order shipped
export const getOrderShippedEmailContent = (
  orderId: string,
  name: string = "User",
  trackingNumber: string,
  carrier: string,
  deliveryTime: string,
  deliveryCity: string
) => {
  const content = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #333;
    }
    p {
      margin-bottom: 10px;
      color: #555;
    }
    .order-details {
      font-weight: bold;
      font-size: 14px;
      color: #333;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Shipped Notification</h1>
    </div>
    <p>Dear ${name},</p>
    <p>We're excited to inform you that your order with Order ID: <span class="order-id">${orderId}</span> has been shipped to the address you provided during checkout.</p>
    <div class="order-details">
      <p><strong>Shipping Details:</strong></p>
      <p>Carrier: <span class="carrier">${carrier}</span></p>
      <p>Tracking Number: <span class="tracking-number">${trackingNumber}</span></p>
      <p>Order Status: <span class="order-status">Shipped</span></p>
      <p>Estimated Delivery Date: <span class="delivery-date">${deliveryTime}</span></p>
      <p>Delivery City: <span class="address">${deliveryCity}</span></p>
    </div>
    <p>You will be notified on the day of delivery. If you have any questions or concerns, please feel free to contact our customer support.</p>
    <p>Thank you for shopping with us!</p>
    <p class="footer">This is an automated email, please do not reply.</p>
  </div>
</body>
</html>
  `;

  return content;
};

// email content for order out for delivery
export const getOrderDeliveryEmailContent = (
  orderId: string,
  name: string = "User",
  trackingNumber: string,
  carrier: string,
  deliveryTime: string,
  deliveryAddress: string
) => {
  const content = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Out for Delivery</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fff;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .header h1 {
        color: #333;
      }
      p {
        margin-bottom: 10px;
        color: #555;
      }
      .order-details {
        font-weight: bold;
        font-size: 14px;
        color: #333;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #777;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Order Out for Delivery</h1>
      </div>
      <p>Dear ${name},</p>
      <p>We're pleased to inform you that your order with Order ID: <span class="order-id">${orderId}</span> is out for delivery.</p>
      <div class="order-details">
        <p><strong>Delivery Details:</strong></p>
        <p>Carrier: <span class="carrier">${carrier}</span></p>
        <p>Tracking Number: <span class="tracking-number">${trackingNumber}</span></p>
        <p>Estimated Delivery Time: <span class="delivery-time">${deliveryTime}</span></p>
        <p>Order Status: <span class="order-status">Out for delivery</span></p>
        <p>Address: <span class="address">${deliveryAddress}</span></p>
      </div>
      <p>If you have any questions or concerns, please feel free to contact our customer support.</p>
      <p>Thank you for shopping with us!</p>
      <p class="footer">This is an automated email, please do not reply.</p>
    </div>
  </body>
  </html>
    `;

  return content;
};
