import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, RefreshCw, MailOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';

const Register = () => {
  const navigate = useNavigate();
  const { register, verifyEmail } = useAuth();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  const [formData, setFormData] = useState({
    // User details
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student', // Default role is student

    // Student details
    rollNumber: '',
    department: '',
    course: '',
    year: '',
    gender: '',
  });

  const [otpData, setOtpData] = useState({
    otp: ['', '', '', '', '', '']
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOTP = [...otpData.otp];
    newOTP[index] = value;
    setOtpData({ otp: newOTP });
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otpData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otp = otpData.otp.join('');
    
    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyEmail(registeredUser.userId, registeredUser.email, otp);

      if (result.success) {
        // Email verified successfully, redirect to login
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.resendOTP({
        userId: registeredUser.userId,
        email: registeredUser.email
      });

      if (response.data.success) {
        // Clear OTP inputs
        setOtpData({ otp: ['', '', '', '', '', ''] });
        // Focus first input
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

    try {
      const response = await authAPI.register(formData);
      if (response.data.success) {
        setRegisteredUser({
          userId: response.data.userId,
          email: response.data.email
        });
        setStep(3); // Move to OTP verification step
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center relative">
        <div className="absolute top-8 left-8 z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-full shadow-lg transition-all">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>
        <img src="/login-image.png" alt="Register" className="w-full h-full object-cover" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-white rounded-full"></div>
        </div>

        <div className="w-full max-w-lg mx-auto relative z-10 px-8 py-8 overflow-y-auto max-h-screen">
          {step === 1 && (
            <>
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-blue-100 text-lg">Join our hostel management system</p>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-blue-200 p-6">
                {error && (
                  <div className="mb-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="w-28 text-sm font-medium text-gray-700 shrink-0">Full Name</label>
                        <div className="relative flex-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-28 text-sm font-medium text-gray-700 shrink-0">Email</label>
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Your e-mail" className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-28 text-sm font-medium text-gray-700 shrink-0">Password</label>
                        <div className="relative flex-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required placeholder="Create password" className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-28 text-sm font-medium text-gray-700 shrink-0">Phone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Academic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="w-28 text-sm font-medium text-gray-700 shrink-0">Roll Number</label>
                        <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required placeholder="Roll number" className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-28 text-sm font-medium text-gray-700 shrink-0">Department</label>
                        <input type="text" name="department" value={formData.department} onChange={handleChange} required placeholder="Department" className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-28 text-sm font-medium text-gray-700 shrink-0">Course</label>
                        <input type="text" name="course" value={formData.course} onChange={handleChange} required placeholder="Course" className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-28 text-sm font-medium text-gray-700 shrink-0">Year</label>
                        <select name="year" value={formData.year} onChange={handleChange} required className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                          <option value="">Select Year</option>
                          {yearOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-28 text-sm font-medium text-gray-700 shrink-0">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link to="/login" className="flex-1 py-3 bg-transparent border-2 border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all text-center text-sm">Sign in</Link>
                    <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 text-sm">
                      {isLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Creating...</span> : 'Create account'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-white mb-2">Verify Email</h1>
                <p className="text-blue-100 text-lg">Code sent to {registeredUser?.email}</p>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-blue-200 p-6">
                {error && (
                  <div className="mb-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">{error}</div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Enter Verification Code</h3>
                    <div className="flex justify-center gap-3">
                      {otpData.otp.map((digit, index) => (
                        <input key={index} id={`otp-${index}`} type="text" value={digit} onChange={(e) => handleOTPChange(index, e.target.value)} onKeyDown={(e) => handleOTPKeyDown(index, e)} maxLength={1} className="w-14 h-14 text-center text-2xl font-bold bg-white border-2 border-gray-300 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" autoFocus={index === 0} />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setStep(1); setRegisteredUser(null); setOtpData({ otp: ['', '', '', '', '', ''] }); }} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-all text-sm">
                      <ArrowLeft className="inline h-4 w-4 mr-1" /> Back
                    </button>
                    <button type="button" onClick={handleVerifyOTP} disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 text-sm">
                      {isLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Verifying...</span> : 'Verify'}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-500 mb-2 text-sm">Didn't receive?</p>
                    <button type="button" onClick={handleResendOTP} disabled={isLoading} className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50">
                      <RefreshCw className="inline h-4 w-4 mr-1" /> Resend Code
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
