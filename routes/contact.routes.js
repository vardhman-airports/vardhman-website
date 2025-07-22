import { Router } from "express";
import express from "express";
const router = Router();

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Add middleware to parse JSON bodies
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Add debugging middleware
router.use((req, res, next) => {
    console.log('Contact route hit:', req.method, req.path);
    console.log('Headers:', req.headers);
    next();
});

router.get("/", (req, res) => {
    res.render("contact.ejs");
});

router.post('/', async (req, res) => {
    console.log('POST request received at /contact');
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Set proper headers for JSON response
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Check if req.body exists
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('No body data received');
            return res.status(400).json({ 
                success: false,
                error: 'No data received' 
            });
        }

        const { firstName, lastName, email, phone, company, position, subject, message } = req.body;
        
        console.log('Extracted fields:', { firstName, lastName, email, phone, company, position, subject, message });
        
        // Validation
        if (!firstName || !lastName || !email || !subject || !message) {
            const missing = [];
            if (!firstName) missing.push('firstName');
            if (!lastName) missing.push('lastName');
            if (!email) missing.push('email');
            if (!subject) missing.push('subject');
            if (!message) missing.push('message');
            
            console.log('Missing required fields:', missing);
            return res.status(400).json({ 
                success: false,
                error: `Missing required fields: ${missing.join(', ')}` 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid email format' 
            });
        }

        // Check environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email credentials not found in environment variables');
            console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
            console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
            return res.status(500).json({ 
                success: false,
                error: 'Email service not configured' 
            });
        }

        console.log('Creating transporter with user:', process.env.EMAIL_USER);

        // Email config - FIXED: Changed createTransporter to createTransport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Test the connection
        console.log('Testing email connection...');
        await transporter.verify();
        console.log('Email transporter verified successfully');

        const mailOptions = {
            from: `"Contact Form" <${process.env.EMAIL_USER}>`,
            to: 'enquiry@vardhmanairports.com',
            subject: `New Contact Form Submission - ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Name:</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${firstName} ${lastName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Email:</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Phone:</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${phone || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Company:</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${company || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Position:</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${position || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Subject:</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${subject}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Message:</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${message.replace(/\n/g, '<br>')}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    This message was sent from the contact form on your website.
                </p>
            `,
            replyTo: email
        };

        console.log('Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        res.json({ 
            success: true, 
            message: 'Your message has been sent successfully! We\'ll get back to you within 24 hours.' 
        });

    } catch (error) {
        console.error('Error in contact form:', error);
        console.error('Error stack:', error.stack);
        
        // Provide more specific error messages
        let errorMessage = 'Sorry, there was an error sending your message. Please try again or contact us directly.';
        
        if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Please contact support.';
        } else if (error.code === 'ECONNECTION') {
            errorMessage = 'Unable to connect to email service. Please try again later.';
        } else if (error.code === 'EMESSAGE') {
            errorMessage = 'Invalid message format. Please check your input.';
        }
        
        res.status(500).json({ 
            success: false,
            error: errorMessage 
        });
    }
});

export default router;