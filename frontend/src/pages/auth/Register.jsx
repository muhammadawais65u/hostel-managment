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
    if (e) e.preventDefault();

    if (formData.role === 'student' && step === 2) {
      if (!validateStep2()) return;
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
    <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-primary-600 p-3 rounded-xl">
            <Building2 className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-secondary-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-secondary-600">
          Join our hostel management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-secondary-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-primary-100 text-primary-700' : 'bg-secondary-200 text-secondary-500'
              }`}>
                1
              </div>
              <span className="text-sm font-medium hidden sm:block">Account</span>
            </div>
            <div className="w-12 h-0.5 bg-secondary-200">
              <div className={`h-full bg-primary-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-secondary-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-primary-100 text-primary-700' : 'bg-secondary-200 text-secondary-500'
              }`}>
                2
              </div>
              <span className="text-sm font-medium hidden sm:block">Profile</span>
            </div>
          </div>
        </div>

        <Card padding="large">
          {error && (
            <div className="mb-4">
              <Alert variant="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {step === 1 && (
              <div className="space-y-6">
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={User}
                  required
                  placeholder="John Doe"
                />

                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  required
                  placeholder="you@example.com"
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    icon={Lock}
                    required
                    placeholder="Create a password"
                    helper="Must be at least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-secondary-400 hover:text-secondary-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                />

                <Select
                  label="Account Type"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: 'student', label: 'Student' },
                    { value: 'warden', label: 'Warden' },
                  ]}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Input
                  label="Roll Number"
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                  placeholder="CS2021001"
                />

                <Select
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  options={departmentOptions}
                  required
                />

                <Input
                  label="Course"
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  placeholder="B.Tech, M.Tech, etc."
                />

                <Select
                  label="Year of Study"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  options={yearOptions}
                  required
                />

                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={genderOptions}
                  required
                />
              </div>
            )}

            <div className="mt-8 flex gap-4">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                isLoading={isLoading}
                className={step === 2 ? 'flex-1' : 'w-full'}
                size="lg"
              >
                {step === 1 ? (
                  formData.role === 'student' ? 'Next' : 'Create Account'
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-secondary-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
