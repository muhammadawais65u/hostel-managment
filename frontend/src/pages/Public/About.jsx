import React from 'react';
import { Building2, Users, Award, Shield, MapPin, Phone, Mail } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About UHBMS</h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              University Hostel Booking and Management System - Your complete solution for modern hostel living
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="card p-8">
            <div className="flex items-center mb-4">
              <Building2 className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-secondary-900">Our Mission</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              To provide a seamless, efficient, and comfortable hostel experience for students through innovative technology 
              and exceptional service. We strive to create a home away from home where students can focus on their academic 
              excellence while enjoying a safe and supportive living environment.
            </p>
          </div>

          <div className="card p-8">
            <div className="flex items-center mb-4">
              <Award className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-secondary-900">Our Vision</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              To become the leading hostel management system in universities nationwide, setting the standard for 
              student accommodation through continuous innovation, sustainable practices, and unwavering commitment to 
              student welfare and success.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Why Choose UHBMS?</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              We offer comprehensive features designed to make hostel life easier and more enjoyable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Secure & Safe</h3>
              <p className="text-secondary-600">
                Advanced security measures and 24/7 monitoring ensure student safety
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Community Focused</h3>
              <p className="text-secondary-600">
                Build lasting friendships and connections in our vibrant community
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Modern Facilities</h3>
              <p className="text-secondary-600">
                State-of-the-art amenities and comfortable living spaces
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Academic Support</h3>
              <p className="text-secondary-600">
                Resources and environment designed to support academic success
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-secondary-100 py-16">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">5000+</div>
              <div className="text-secondary-600 font-medium">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">15+</div>
              <div className="text-secondary-600 font-medium">Hostels</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-secondary-600 font-medium">Rooms</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">98%</div>
              <div className="text-secondary-600 font-medium">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-16">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-secondary-600">
              Have questions? We're here to help
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Visit Us</h3>
              <p className="text-secondary-600">
                University Campus, Main Road<br />
                City, State 123456
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Call Us</h3>
              <p className="text-secondary-600">
                +91 123 456 7890<br />
                Mon-Fri: 9AM-6PM
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Email Us</h3>
              <p className="text-secondary-600">
                info@UHBMS.edu<br />
                support@UHBMS.edu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
