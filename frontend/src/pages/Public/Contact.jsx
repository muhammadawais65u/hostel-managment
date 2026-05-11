import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';
import { complaintAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If subject is complaint, submit as a complaint via public route
      if (formData.subject === 'complaint') {
        await complaintAPI.createPublic({
          name: formData.name,
          email: formData.email,
          title: formData.subject,
          description: formData.message,
          category: 'other',
          priority: 'medium'
        });
        alert('Complaint submitted successfully! You will receive an email confirmation and our team will respond within 2-3 business days.');
      } else {
        // For other subjects, just simulate submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Thank you for your message. We will get back to you soon!');
      }

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Building2,
      title: 'Main Office',
      details: [
        'University Hostel Booking and Management System',
        'University Campus, Main Road',
        'City, State 123456'
      ]
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      details: [
        '+91 123 456 7890 (Office)',
        '+91 987 654 3210 (Emergency)',
        'Mon-Fri: 9:00 AM - 6:00 PM'
      ]
    },
    {
      icon: Mail,
      title: 'Email Addresses',
      details: [
        'info@UHBMS.edu (General Inquiries)',
        'support@UHBMS.edu (Technical Support)',
        'warden@UHBMS.edu (Warden Office)'
      ]
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: [
        'Monday - Friday: 9:00 AM - 6:00 PM',
        'Saturday: 10:00 AM - 4:00 PM',
        'Sunday: Closed'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I apply for hostel accommodation?',
      answer: 'You can apply for hostel accommodation by filling out the online application form available on our website. You will need to provide your student details and required documents.'
    },
    {
      question: 'What documents are required for hostel admission?',
      answer: 'Required documents include: Student ID card, Admission letter, Address proof, Recent passport-size photographs, and Parental consent form.'
    },
    {
      question: 'How can I pay hostel fees?',
      answer: 'Hostel fees can be paid online through our payment portal, by bank transfer, or at the hostel office in person. We accept all major payment methods.'
    },
    {
      question: 'What are the hostel rules and regulations?',
      answer: 'Detailed hostel rules and regulations are provided in the student handbook. Key rules include maintaining discipline, respecting others, and following the mess and room allocation policies.'
    },
    {
      question: 'Who do I contact for maintenance issues?',
      answer: 'For maintenance issues, please contact the hostel warden or fill out the maintenance request form available in your student dashboard.'
    }
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              We're here to help you with any questions or concerns about hostel accommodation
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-16">
       

        {/* Contact Form and Map */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="form-label">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="select-field"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="admission">Admission Query</option>
                  <option value="fees">Fee Related</option>
                  <option value="maintenance">Maintenance Issue</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="form-label">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="input-field"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map Placeholder */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Find Us</h2>
            <div className="bg-secondary-100 rounded-lg h-64 flex items-center justify-center mb-6">
              <div className="text-center text-secondary-500">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p>Interactive Map</p>
                <p className="text-sm">University Campus Location</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-secondary-900">Location</h4>
                  <p className="text-secondary-600">University Campus, Main Road, City, State 123456</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-secondary-900">Emergency Contact</h4>
                  <p className="text-secondary-600">+92 987 654 3210 (24/7 Available)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-secondary-600">
              Quick answers to common questions about hostel accommodation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-2">{faq.question}</h3>
                    <p className="text-secondary-600">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
