import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Shield,
  CreditCard,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Bed,
  Clock,
  Award
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Landing = () => {
  const features = [
    {
      icon: Bed,
      title: 'Easy Room Booking',
      description: 'Browse and book hostel rooms with our intuitive interface. Filter by preferences and availability.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: MessageSquare,
      title: 'Complaint Management',
      description: 'Submit and track maintenance requests and complaints in real-time with status updates.',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: CreditCard,
      title: 'Online Fee Payment',
      description: 'Secure online payment system for hostel fees with instant receipt generation.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Role-based access control ensures data security and privacy for all users.',
      color: 'bg-red-50 text-red-600',
    },
    {
      icon: Users,
      title: 'Student Management',
      description: 'Comprehensive student profiles with room allocations, fee status, and application history.',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock support system with dedicated wardens and admin assistance.',
      color: 'bg-teal-50 text-teal-600',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Students Housed' },
    { value: '50+', label: 'Hostel Buildings' },
    { value: '99%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="min-h-screen bg-white">
     
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative  mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Award className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium">Award-Winning Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Modern Hostel Management{' '}
                <span className="text-yellow-300">Made Simple</span>
              </h1>

              <p className="text-lg text-primary-100 max-w-xl">
                Streamline your university hostel operations with our comprehensive booking and management system. 
                Built for students, wardens, and administrators.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm"
                    rightIcon={ArrowRight}
                  >
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary-600 border-2 text-primary-600 hover:bg-primary-50"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-white/20 border-2 border-primary-600 flex items-center justify-center text-sm font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-primary-100">
                  Trusted by <strong>10,000+</strong> students
                </p>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <Building2 className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900">Boys Hostel </p>
                      <p className="text-sm text-secondary-500">2 rooms available</p>
                    </div>
                  </div>
                  <span className="badge badge-success">Open</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-secondary-400" />
                      <span className="font-medium text-secondary-700">Room 101</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Available</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-secondary-400" />
                      <span className="font-medium text-secondary-700">Room 102</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Available</span>
                  </div>
                </div>

                <Button className="w-full mt-6">
                  Apply Now
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400 rounded-full opacity-20 blur-xl" />
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-primary-600">{stat.value}</p>
                <p className="mt-1 text-sm text-secondary-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary-50">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-lg text-secondary-600">
              Our comprehensive platform offers all the tools you need for efficient hostel management,
              from booking to maintenance and beyond.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                padding="large"
                className="group hover:shadow-card transition-shadow duration-300"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-primary-100 mb-8">
                Join thousands of students and administrators who trust our platform for their hostel management needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-white text-primary-700 hover:bg-primary-50"
                  >
                    Create Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
