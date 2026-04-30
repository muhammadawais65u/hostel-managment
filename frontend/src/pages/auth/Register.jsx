import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // User details
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',

    // Student details
    rollNumber: '',
    department: '',
    course: '',
    year: '',
    gender: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.rollNumber || !formData.department || !formData.course || !formData.year || !formData.gender) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      if (formData.role === 'student') {
        setStep(2);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required personal information fields');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // For students, validate academic fields
    if (formData.role === 'student') {
      if (!formData.rollNumber || !formData.department || !formData.course || !formData.year || !formData.gender) {
        setError('Please fill in all required academic information fields');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    const result = await register(formData);

    if (result.success) {
      const { user } = result;
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'warden') {
        navigate('/warden/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
    { value: '5', label: '5th Year' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const departmentOptions = [
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Mechanical', label: 'Mechanical' },
    { value: 'Civil', label: 'Civil' },
    { value: 'Electrical', label: 'Electrical' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="w-full max-w-4xl mx-auto relative z-10 px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl mb-6">
            <User className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-4xl font-bold text-white mb-2">Create Account</h3>
          <p className="text-gray-300 text-lg">Join our hostel community</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/10 via-pink-600/5 to-indigo-600/10 backdrop-blur-lg border border-purple-500/30 shadow-2xl shadow-purple-500/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/3 via-pink-600/2 to-indigo-600/3"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {error && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 border border-red-500/30 backdrop-blur-sm text-red-200 px-4 py-3 rounded-xl">
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information - 2x2 Grid */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-white/20">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Create a strong password"
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters long</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Type - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                >
                  <option value="student" className="bg-gray-800">Student</option>
                  <option value="warden" className="bg-gray-800">Warden</option>
                </select>
              </div>

              {/* Academic Information - 2x2 Grid */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-white/20">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Roll Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        placeholder="CS2021001"
                        className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                    >
                      <option value="" className="bg-gray-800">Select Department</option>
                      {departmentOptions.map((dept) => (
                        <option key={dept.value} value={dept.value} className="bg-gray-800">
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        placeholder="B.Tech, M.Tech, etc."
                        className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Year of Study</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                    >
                      <option value="" className="bg-gray-800">Select Year</option>
                      {yearOptions.map((year) => (
                        <option key={year.value} value={year.value} className="bg-gray-800">
                          {year.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gender - Full Width */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                  >
                    <option value="" className="bg-gray-800">Select Gender</option>
                    {genderOptions.map((gender) => (
                      <option key={gender.value} value={gender.value} className="bg-gray-800">
                        {gender.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transform transition-all duration-200 hover:scale-[1.02] shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-gray-400 font-medium">
                    Already Registered?
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-300">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
