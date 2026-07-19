const PDFDocument = require('pdfkit');

const generateInvoice = (order, user, items) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      // Header
      doc.fontSize(24).text('LEATHER & GOODS', 50, 50);
      doc.fontSize(12).text('Premium Leather Accessories', 50, 80);
      doc.moveDown();

      // Invoice Details
      doc.fontSize(16).text('INVOICE', 50, 120);
      doc.fontSize(10)
        .text(`Invoice #: INV-${order.id}`, 50, 150)
        .text(`Tracking ID: ${order.tracking_id}`, 50, 165)
        .text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 50, 180)
        .text(`Status: ${order.status.toUpperCase().replace(/_/g, ' ')}`, 50, 195);

      // Customer Info
      doc.fontSize(14).text('Bill To:', 350, 150);
      doc.fontSize(10)
        .text(`${user.first_name} ${user.last_name}`, 350, 170)
        .text(user.email, 350, 185);

      if (order.shipping_address) {
        const addr = order.shipping_address;
        doc.text(`${addr.fullName}`, 350, 200)
           .text(`${addr.address}`, 350, 215)
           .text(`${addr.city}`, 350, 230);
      }

      // Items Table
      doc.moveDown(3);
      doc.fontSize(12).text('Order Items:', 50, 280);

      let y = 310;
      doc.fontSize(10)
        .text('Item', 50, y)
        .text('Color', 250, y)
        .text('Qty', 350, y)
        .text('Price', 420, y)
        .text('Total', 500, y);

      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
      y += 30;

      items.forEach(item => {
        doc.text(item.title || 'Product', 50, y, { width: 180 })
           .text(item.color || '-', 250, y)
           .text(item.quantity.toString(), 350, y)
           .text(`$${item.unit_price}`, 420, y)
           .text(`$${(item.quantity * item.unit_price).toFixed(2)}`, 500, y);
        y += 25;
      });

      // Totals
      doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
      y += 30;
      doc.fontSize(12).text(`Total Amount: $${order.total_amount}`, 380, y);

      // Footer
      doc.fontSize(10)
        .text('Thank you for your business!', 50, 700, { align: 'center' })
        .text('For support, contact us at support@leathergoods.com', 50, 720, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
