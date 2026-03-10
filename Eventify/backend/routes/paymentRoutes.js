const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const ConcertEvent = require('../models/ConcertEvent');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

router.post('/', protect, async (req, res) => {
    const { concertEventId, ticketCategory, amount, customerDetails } = req.body;

    try {
        const payment = new Payment({
            user: req.user._id,
            concertEvent: concertEventId,
            ticketCategory,
            amount,
            customerDetails
        });
        const createdPayment = await payment.save();

        const populatedPayment = await Payment.findById(createdPayment._id)
            .populate('user', 'name email')
            .populate({
                path: 'concertEvent',
                populate: { path: 'user', select: 'name email' }
            });

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });


            if (populatedPayment.user && populatedPayment.user.email) {
                const receiptEmail = {
                    from: process.env.EMAIL_USER,
                    to: populatedPayment.user.email,
                    subject: '🎫 Payment Receipt - Eventify',
                    html: `
                            <h2>Payment Successful!</h2>
                            <p>Dear ${customerDetails.name},</p>
                            <p>Thank you for your purchase. Here are your ticket details:</p>
                            <hr>
                            <p><strong>Event:</strong> ${populatedPayment.concertEvent.name}</p>
                            <p><strong>Location:</strong> ${populatedPayment.concertEvent.location}</p>
                            <p><strong>Ticket Category:</strong> ${ticketCategory.toUpperCase()}</p>
                            <p><strong>Amount Paid:</strong> ₹${amount}</p>
                            <p><strong>Address:</strong> ${customerDetails.address}</p>
                            <hr>
                            <p>See you at the event!</p>
                            <p><em>- Eventify Team</em></p>
                        `
                };

                try {
                    await transporter.sendMail(receiptEmail);
                } catch (err) { console.error('Receipt email failed:', err); }
            }

            if (populatedPayment.concertEvent.user && populatedPayment.concertEvent.user.email) {
                const notificationEmail = {
                    from: process.env.EMAIL_USER,
                    to: populatedPayment.concertEvent.user.email,
                    subject: '💰 New Ticket Purchase - Eventify',
                    html: `
                            <h2>New Ticket Sold!</h2>
                            <p>Dear ${populatedPayment.concertEvent.user.name},</p>
                            <p>Great news! Someone just purchased a ticket for your event.</p>
                            <hr>
                            <p><strong>Event:</strong> ${populatedPayment.concertEvent.name}</p>
                            <p><strong>Buyer:</strong> ${customerDetails.name}</p>
                            <p><strong>Ticket Category:</strong> ${ticketCategory.toUpperCase()}</p>
                            <p><strong>Amount:</strong> ₹${amount}</p>
                            <hr>
                            <p><em>- Eventify Team</em></p>
                        `
                };

                try {
                    await transporter.sendMail(notificationEmail);
                } catch (err) { console.error('Notification email failed:', err); }
            }
        } else {
            console.log('📧 Email simulation (no credentials):');
            if (populatedPayment.user) {
                console.log('Receipt would be sent to:', populatedPayment.user.email);
            }
            if (populatedPayment.concertEvent.user) {
                console.log('Notification would be sent to:', populatedPayment.concertEvent.user.email);
            } else {
                console.log('No creator email found for this event.');
            }
            console.log('Payment details:', { ticketCategory, amount, customerDetails });
        }

        res.status(201).json({ message: 'Payment successful', payment: createdPayment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
