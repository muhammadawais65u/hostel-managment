import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import Footer from './Footer';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Hostels', href: '/hostels' },
    { name: 'Contact', href: '/contact' },
  ];

  const authLinks = [
    { name: 'Login', href: '/login' },
    { name: 'Register', href: '/register' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
     
           <Navbar />
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
