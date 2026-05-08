import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  ArrowLeft,
  Loader2,
  Download,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Bed,
  X
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const Payment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [paidPayments, setPaidPayments] = useState([]);
  const [calculatedStats, setCalculatedStats] = useState({
    totalPaid: 0,
    totalDue: 0,
    pending: 0,
    totalFees: 0
  });
  const [rescheduledPayments, setRescheduledPayments] = useState([]);

  useEffect(() => {
    fetchPaymentData();
    fetchApprovedApplications();
    fetchPaymentHistory();
    fetchRescheduledPayments();
  }, [selectedMonth, selectedYear]);

  // Refresh rescheduled payments every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRescheduledPayments();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateStatistics();
  }, [paidPayments, approvedApplications, paymentData]);

  const calculateStatistics = () => {
    const paidAmount = paidPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const unpaidAmount = approvedApplications.reduce((sum, app) => {
      const price = app.roomInfo?.price || 0;
      return sum + (typeof price === 'string' ? parseFloat(price) || 0 : price);
    }, 0);
    const totalFees = paidAmount + unpaidAmount;
    
    console.log('Statistics calculation:');
    console.log('Paid payments:', paidPayments);
    console.log('Approved applications:', approvedApplications);
    console.log('Paid amount:', paidAmount);
    console.log('Unpaid amount:', unpaidAmount);
    console.log('Total fees:', totalFees);
    
    setCalculatedStats({
      totalPaid: paidAmount,
      totalDue: unpaidAmount,
      pending: unpaidAmount,
      totalFees: totalFees
    });
  };

  const fetchPaymentData = async () => {
    try {
      const response = await studentAPI.getFees(selectedMonth, selectedYear);
      setPaymentData(response.data.data);
    } catch (err) {
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedApplications = async () => {
    try {
      const response = await studentAPI.getApplications();
      const approved = response.data.data.filter(app => 
        app.status === 'approved' && app.paymentStatus !== 'paid'
      );
      setApprovedApplications(approved);
    } catch (err) {
      console.error('Failed to load approved applications:', err);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await studentAPI.getPaymentHistory();
      console.log('Payment history response:', response.data);
      console.log('Payment history data:', response.data.data);
      setPaidPayments(response.data.data || []);
    } catch (err) {
      console.error('Failed to load payment history:', err);
    }
  };

  const fetchRescheduledPayments = async () => {
    try {
      console.log('🔄 Fetching only rescheduled payments data...');
      const response = await studentAPI.getRescheduledPayments();
      console.log('✅ Rescheduled payments response:', response.data);
      console.log('📊 Rescheduled payments data:', response.data.data);
      console.log('📏 Data length:', response.data.data?.length || 0);
      
      // Filter to show only actual rescheduled payments with valid data
      const validRescheduledPayments = (response.data.data || []).filter(payment => 
        payment.applicationId && 
        payment.nextPaymentDate && 
        payment.customAmount > 0
      );
      
      console.log('🎯 Valid rescheduled payments:', validRescheduledPayments.length);
      
      if (validRescheduledPayments.length > 0) {
        console.log('🎯 Rescheduled payments details:');
        validRescheduledPayments.forEach((payment, index) => {
          console.log(`  ${index + 1}. Application ID: ${payment.applicationId}`);
          console.log(`     Room: ${payment.roomNumber}`);
          console.log(`     Next Payment: ${payment.nextPaymentDate}`);
          console.log(`     Amount: ${payment.customAmount}`);
        });
      }
      
      // Only set valid rescheduled payments data
      setRescheduledPayments(validRescheduledPayments);
    } catch (err) {
      console.error('❌ Failed to load rescheduled payments:', err);
      console.error('🔍 Error details:', err.response?.data || err.message);
    }
  };

  const handlePaymentClick = (application) => {
    setSelectedRoom(application);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setError('');
    setSuccess('');

    try {
      const paymentData = {
        applicationId: selectedRoom._id,
        cardNumber: paymentForm.cardNumber,
        cardholderName: paymentForm.cardholderName,
        expiryDate: paymentForm.expiryDate,
        cvv: paymentForm.cvv,
        amount: selectedRoom.roomInfo?.price || 5000
      };

      const response = await studentAPI.makePayment(paymentData);
      
      setReceipt({
        ...response.data.data,
        date: new Date().toLocaleDateString(),
        status: 'Payment Completed'
      });
      
      setSuccess('Payment processed successfully!');
      setShowPaymentModal(false);
      
      console.log('Payment successful, refreshing data...');
      
      // Refresh data
      fetchPaymentData();
      fetchApprovedApplications();
      fetchPaymentHistory();
    } catch (err) {
      setError('Failed to process payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (receipt) {
      const receiptContent = `
PAYMENT RECEIPT
===============
Date: ${receipt.date}
Status: ${receipt.status}
Amount: PKR ${receipt.amount}
Transaction ID: ${receipt.transactionId}
Room: ${selectedRoom?.roomInfo?.roomNumber}
Room Type: ${selectedRoom?.roomInfo?.roomType}

Payment Completed Successfully!
      `;
      
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_receipt_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const handlePayment = async (feeId) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await studentAPI.makePayment(feeId);
      setSuccess('Payment processed successfully!');
      fetchPaymentData();
    } catch (err) {
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      paid: { variant: 'success', label: 'Paid', color: 'text-green-400' },
      unpaid: { variant: 'danger', label: 'Unpaid', color: 'text-red-400' },
      partial: { variant: 'warning', label: 'Partial', color: 'text-yellow-400' },
      overdue: { variant: 'danger', label: 'Overdue', color: 'text-red-400' }
    };
    return variants[status] || variants.unpaid;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Payment Information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/30 backdrop-blur-sm text-red-200 px-6 py-4 rounded-xl">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const { fees, paymentHistory, roomAllocation } = paymentData || {};

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">
        <div className=" mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              leftIcon={ArrowLeft}
              onClick={() => navigate('/student/dashboard')}
              className="text-gray-600 hover:text-gray-800 mb-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment</h1>
            <p className="text-gray-600">Manage your hostel fees and payments</p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
  {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-green-600 text-sm mb-2">Total Paid</p>
              <p className="text-gray-900 text-2xl font-bold">PKR {calculatedStats.totalPaid.toLocaleString()}</p>
            </div>

            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-red-600 text-sm mb-2">Total Due</p>
              <p className="text-gray-900 text-2xl font-bold">PKR {calculatedStats.totalDue.toLocaleString()}</p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-blue-600 text-sm mb-2">Pending</p>
              <p className="text-gray-900 text-2xl font-bold">PKR {calculatedStats.pending.toLocaleString()}</p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-purple-600 text-sm mb-2">Total Fees</p>
              <p className="text-gray-900 text-2xl font-bold">PKR {calculatedStats.totalFees.toLocaleString()}</p>
            </div>
          </div>

          {/* Approved Room Cards */}
          {approvedApplications.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Bed className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Approved Rooms - Make Payment</h2>
                  <p className="text-gray-600">Complete your payment to confirm room allocation</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedApplications.map((application) => (
                  <div key={application._id} className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-green-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Gradient accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Bed className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          Room {application.roomInfo?.roomNumber}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-green-600 text-sm font-medium">Approved</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 text-xs mb-1">Student Name</p>
                        <p className="text-gray-900 font-semibold text-sm">{application.personalInfo?.name || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 text-xs mb-1">Email</p>
                        <p className="text-gray-900 font-semibold text-sm truncate">{application.personalInfo?.email || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 text-xs mb-1">Room Type</p>
                        <p className="text-gray-900 font-semibold text-sm capitalize">{application.roomType}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 text-xs mb-1">Department</p>
                        <p className="text-gray-900 font-semibold text-sm">{application.personalInfo?.department || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-xs mb-1">Total Amount</p>
                          <p className="text-gray-900 text-2xl font-bold">PKR {application.roomInfo?.price || '5000'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs mb-1">Applied</p>
                          <p className="text-gray-700 text-sm">{new Date(application.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="success"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                      onClick={() => handlePaymentClick(application)}
                    >
                      <CreditCard className="h-5 w-5" />
                      Pay Now
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Month Payment Section */}
          {console.log('Rendering Next Payment Schedule section, rescheduledPayments length:', rescheduledPayments.length)}
          {rescheduledPayments.length > 0 ? (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Next Payment Schedule</h2>
                  <p className="text-gray-600">Your rescheduled payment details</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rescheduledPayments.map((payment) => (
                  <div key={payment.applicationId} className="group relative bg-white rounded-2xl p-6 border-2 border-yellow-100 hover:border-orange-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Gradient accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-600"></div>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          Room {payment.roomNumber}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <p className="text-yellow-600 text-sm font-medium">Payment Rescheduled</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-yellow-50 rounded-xl p-3">
                        <p className="text-yellow-600 text-xs mb-1">Next Payment Date</p>
                        <p className="text-gray-900 font-bold text-sm">
                          {new Date(payment.nextPaymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-3">
                        <p className="text-yellow-600 text-xs mb-1">Frequency</p>
                        <p className="text-gray-900 font-semibold text-sm capitalize">{payment.paymentFrequency}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-3">
                        <p className="text-yellow-600 text-xs mb-1">Amount Due</p>
                        <p className="text-gray-900 font-bold text-sm">PKR {payment.customAmount?.toLocaleString()}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-3">
                        <p className="text-yellow-600 text-xs mb-1">Room Type</p>
                        <p className="text-gray-900 font-semibold text-sm capitalize">{payment.roomType}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6 border border-yellow-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-600 text-xs">Card on File</span>
                          <span className="text-gray-700 text-sm font-mono">**** **** **** {payment.cardLastFour}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-yellow-600 text-xs">Reason</span>
                          <span className="text-gray-700 text-sm text-right max-w-[60%]">{payment.rescheduleReason}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="warning"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 transition-all duration-300"
                      onClick={() => handlePaymentClick(payment)}
                    >
                      <CreditCard className="h-5 w-5" />
                      Pay Now
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Next Payment Schedule</h2>
                  <p className="text-gray-600">Your upcoming payment information</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 text-center border border-gray-200">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Rescheduled Payments</h3>
                <p className="text-gray-500">You don't have any rescheduled payments at the moment.</p>
              </div>
            </div>
          )}

          {/* Paid Payments Section */}
          {paidPayments.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Paid Payments</h2>
                  <p className="text-gray-600">Your payment history</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paidPayments.map((payment) => {
                  console.log('Rendering payment:', payment);
                  return (
                    <div key={payment.transactionId} className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Gradient accent */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                          <CheckCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">
                            Room {payment.roomNumber}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-green-600 text-sm font-medium">Paid</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Student Name</p>
                          <p className="text-gray-900 font-semibold text-sm">{payment.studentName || 'You'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Email</p>
                          <p className="text-gray-900 font-semibold text-sm truncate">{payment.studentEmail || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Department</p>
                          <p className="text-gray-900 font-semibold text-sm">{payment.department || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Room Type</p>
                          <p className="text-gray-900 font-semibold text-sm capitalize">{payment.roomType}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-xs mb-1">Amount Paid</p>
                            <p className="text-gray-900 text-2xl font-bold">PKR {payment.amount?.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500 text-xs mb-1">Payment Date</p>
                            <p className="text-gray-700 text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                          onClick={() => setReceipt(payment)}
                        >
                          <FileText className="h-4 w-4" />
                          View Receipt
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Room Allocation */}
          {roomAllocation && (
            <div className="mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <Bed className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Your Allocated Room</h2>
                    <p className="text-blue-200">Room {roomAllocation.roomNumber} has been allocated to you</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Room Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-blue-200 text-sm">Room Number</p>
                        <p className="text-white text-xl font-bold">{roomAllocation.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Room Type</p>
                        <p className="text-white text-xl font-bold">{roomAllocation.type}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Floor</p>
                        <p className="text-white text-xl font-bold">{roomAllocation.floor}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Capacity</p>
                        <p className="text-white text-xl font-bold">{roomAllocation.capacity} persons</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-blue-200 text-sm">Monthly Rent</p>
                        <p className="text-white text-xl font-bold">PKR {roomAllocation.rentPerMonth}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Security Deposit</p>
                        <p className="text-white text-xl font-bold">PKR {roomAllocation.securityDeposit}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Total Due</p>
                        <p className="text-white text-xl font-bold text-green-300">PKR {roomAllocation.totalDue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        
        
        
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPaymentModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Bed className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Room {selectedRoom.roomInfo?.roomNumber}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{selectedRoom.roomInfo?.roomType}</p>
                <p className="text-2xl font-bold text-green-600">PKR {selectedRoom.roomInfo?.price || '5000'}</p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={paymentForm.cardholderName}
                    onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentForm.expiryDate}
                      onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="success"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pay PKR {selectedRoom.roomInfo?.price || '5000'}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Payment Receipt</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReceipt(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold text-green-800">Payment Completed!</h3>
                    <p className="text-green-600 text-sm">{receipt.date}</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">{receipt.transactionId || 'TXN' + Date.now()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-green-600">PKR {receipt.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">{selectedRoom?.roomInfo?.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-medium">{selectedRoom?.roomInfo?.roomType}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="success"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleDownloadReceipt}
              >
                <Download className="h-5 w-5" />
                Download Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
