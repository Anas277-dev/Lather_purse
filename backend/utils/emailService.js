const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"Leather & Goods" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
};

const sendOrderConfirmation = async (email, orderDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B4513;">Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
        <p><strong>Tracking ID:</strong> ${orderDetails.trackingId}</p>
        <p><strong>Total:</strong> $${orderDetails.totalAmount}</p>
        <p><strong>Status:</strong> Order Placed</p>
      </div>
      <p style="margin-top: 20px;">You can track your order status in your account dashboard.</p>
    </div>
  `;
  return sendEmail(email, `Order Confirmed - ${orderDetails.trackingId}`, html);
};

const sendOrderStatusUpdate = async (email, orderDetails) => {
  const statusMessages = {
    order_placed: 'Your order has been placed successfully!',
    dispatched: 'Great news! Your order has been dispatched.',
    out_for_delivery: 'Your order is out for delivery today!',
    delivered: 'Your order has been delivered. Enjoy your purchase!'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B4513;">Order Status Update</h2>
      <p>${statusMessages[orderDetails.status] || 'Your order status has been updated.'}</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
        <p><strong>Tracking ID:</strong> ${orderDetails.trackingId}</p>
        <p><strong>New Status:</strong> ${orderDetails.status.replace(/_/g, ' ').toUpperCase()}</p>
      </div>
    </div>
  `;
  return sendEmail(email, `Order Update - ${orderDetails.trackingId}`, html);
};

const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B4513;">Welcome to Leather & Goods!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining our premium leather goods family. Explore our exclusive collection of handcrafted purses and belts.</p>
      <a href="${process.env.FRONTEND_URL}/shop" style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px;">Start Shopping</a>
    </div>
  `;
  return sendEmail(email, 'Welcome to Leather & Goods!', html);
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendWelcomeEmail
};
