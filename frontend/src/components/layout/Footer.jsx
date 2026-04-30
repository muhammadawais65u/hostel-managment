import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Share2, MessageCircle, Camera, Briefcase } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { name: 'Home', href: '/' },
      { name: 'About Us', href: '/about' },
      { name: 'Hostels', href: '/hostels' },
      { name: 'Contact', href: '/contact' },
    ],
    services: [
      { name: 'Room Booking', href: '#' },
      { name: 'Complaints', href: '#' },
      { name: 'Fee Payment', href: '#' },
      { name: 'Maintenance', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'FAQs', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Share2, href: '#' },
    { name: 'Twitter', icon: MessageCircle, href: '#' },
    { name: 'Instagram', icon: Camera, href: '#' },
    { name: 'LinkedIn', icon: Briefcase, href: '#' },
  ];

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">UHMS</span>
            </Link>
            <p className="text-secondary-400 text-sm mb-4">
              University Hostel Management System - Your complete solution for modern hostel booking and management.
            </p>
            <div className="space-y-2">
              <a href="mailto:contact@university.edu" className="flex items-center gap-2 text-secondary-400 hover:text-white text-sm transition-colors">
                <Mail className="h-4 w-4" />
                contact@university.edu
              </a>
              <a href="tel:+911234567890" className="flex items-center gap-2 text-secondary-400 hover:text-white text-sm transition-colors">
                <Phone className="h-4 w-4" />
                +91 123 456 7890
              </a>
              <p className="flex items-center gap-2 text-secondary-400 text-sm">
                <MapPin className="h-4 w-4" />
                University Campus, India
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-secondary-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-secondary-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-secondary-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-secondary-400 text-sm">
              {currentYear} University Hostel Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-secondary-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
