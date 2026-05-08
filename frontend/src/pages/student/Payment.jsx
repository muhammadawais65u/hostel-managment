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

  useEffect(() => {
    fetchPaymentData();
    fetchApprovedApplications();
  }, [selectedMonth, selectedYear]);

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
      const approved = response.data.data.filter(app => app.status === 'approved');
      setApprovedApplications(approved);
    } catch (err) {
      console.error('Failed to load approved applications:', err);
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
      
      // Refresh data
      fetchPaymentData();
      fetchApprovedApplications();
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
Amount: ₹${receipt.amount}
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

  const { fees, statistics, paymentHistory, roomAllocation } = paymentData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              leftIcon={ArrowLeft}
              onClick={() => navigate('/student/dashboard')}
              className="text-white hover:text-purple-200 mb-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">Payment</h1>
            <p className="text-purple-200">Manage your hostel fees and payments</p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 backdrop-blur-sm text-green-200 px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 backdrop-blur-sm text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Approved Room Cards */}
          {approvedApplications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Approved Rooms - Make Payment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedApplications.map((application) => (
                  <div key={application._id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-green-500/50 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-600 rounded-xl">
                        <Bed className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Room {application.roomInfo?.roomNumber}
                        </h3>
                        <p className="text-green-200 text-sm">Approved</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div>
                        <p className="text-purple-200 text-sm">Room Type</p>
                        <p className="text-white font-medium">{application.roomInfo?.roomType}</p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm">Floor</p>
                        <p className="text-white font-medium">{application.roomInfo?.floor}</p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm">Capacity</p>
                        <p className="text-white font-medium">{application.roomInfo?.capacity} persons</p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm">Price</p>
                        <p className="text-white font-bold text-xl">₹{application.roomInfo?.price || '5000'}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="success"
                      className="w-full flex items-center justify-center gap-2"
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
                        <p className="text-white text-xl font-bold">₹{roomAllocation.rentPerMonth}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Security Deposit</p>
                        <p className="text-white text-xl font-bold">₹{roomAllocation.securityDeposit}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Total Due</p>
                        <p className="text-white text-xl font-bold text-green-300">₹{roomAllocation.totalDue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-300" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-green-200 text-sm mb-2">Total Paid</p>
              <p className="text-white text-2xl font-bold">₹{statistics?.totalPaid?.toLocaleString() || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-red-600/20 to-orange-500/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-red-300" />
                </div>
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-red-200 text-sm mb-2">Total Due</p>
              <p className="text-white text-2xl font-bold">₹{statistics?.totalDue?.toLocaleString() || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-300" />
                </div>
                <Clock className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-blue-200 text-sm mb-2">Pending</p>
              <p className="text-white text-2xl font-bold">₹{statistics?.pending?.toLocaleString() || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <FileText className="h-6 w-6 text-purple-300" />
                </div>
                <CheckCircle className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-purple-200 text-sm mb-2">Total Fees</p>
              <p className="text-white text-2xl font-bold">₹{statistics?.totalFees?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Month Selector */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/10 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/30 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index} className="bg-gray-800">
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {[2023, 2024, 2025].map(year => (
                    <option key={year} value={year} className="bg-gray-800">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-white">
                <p className="text-sm text-purple-200">Current Period</p>
                <p className="font-semibold">{monthNames[selectedMonth]} {selectedYear}</p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          {roomAllocation && (
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Online Payment</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <Button
                      variant="success"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      Pay Now
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Transfer</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        placeholder="State Bank of India"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        placeholder="123456789012"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="SBIN0001234"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Reference</label>
                      <input
                        type="text"
                        placeholder="HOSTEL2024001"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <DollarSign className="h-5 w-5" />
                      Confirm Transfer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Fees */}
          <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Current Fees</h2>
            
            <div className="space-y-4">
              {fees?.length > 0 ? (
                fees.map((fee) => {
                  const statusConfig = getStatusBadge(fee.status);
                  return (
                    <div key={fee._id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{fee.type}</h3>
                            <Badge variant={statusConfig.variant}>
                              {statusConfig.label}
                            </Badge>
                            {fee.dueDate && (
                              <span className="text-purple-300 text-sm">
                                Due: {new Date(fee.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-purple-300">Amount</p>
                              <p className="text-white font-semibold">₹{fee.amount?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-purple-300">Paid</p>
                              <p className="text-green-300 font-semibold">₹{fee.paidAmount?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-purple-300">Balance</p>
                              <p className="text-red-300 font-semibold">₹{(fee.amount - fee.paidAmount)?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {fee.status === 'unpaid' || fee.status === 'partial' ? (
                            <>
                              <Button
                                onClick={() => handlePayment(fee._id)}
                                isLoading={loading}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                              >
                                Pay Now
                              </Button>
                              <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                                <Eye className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" className="border-green-500/30 text-green-300 hover:bg-green-500/20">
                                <Download className="h-4 w-4 mr-2" />
                                Receipt
                              </Button>
                              <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                                <Eye className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                  <p className="text-purple-200">No fees found for this period</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">Payment History</h2>
            
            <div className="space-y-4">
              {paymentHistory?.length > 0 ? (
                paymentHistory.slice(0, 10).map((payment) => (
                  <div key={payment._id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                          <CheckCircle className="h-6 w-6 text-green-300" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{payment.type}</p>
                          <p className="text-blue-200 text-sm">
                            {new Date(payment.paymentDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-300 font-bold">₹{payment.amount?.toLocaleString() || 0}</p>
                        <p className="text-blue-300 text-sm">{payment.method}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-200">No payment history found</p>
                </div>
              )}
            </div>
          </div>
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
                <p className="text-2xl font-bold text-green-600">₹{selectedRoom.roomInfo?.price || '5000'}</p>
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
                      Pay ₹{selectedRoom.roomInfo?.price || '5000'}
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
                    <span className="font-bold text-green-600">₹{receipt.amount}</span>
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
