const twilio = require('twilio');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: to.startsWith('+') ? to : `+${to}`
    });
    console.log('SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS send failed:', error);
    // Don't throw - SMS is non-critical
    return null;
  }
};

const sendOrderSMS = async (phone, trackingId, status) => {
  const message = `Leather & Goods: Your order ${trackingId} status is now: ${status.replace(/_/g, ' ').toUpperCase()}. Track at ${process.env.FRONTEND_URL}/track/${trackingId}`;
  return sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendOrderSMS
};
