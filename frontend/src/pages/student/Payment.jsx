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
  TrendingDown
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPaymentData();
  }, [selectedMonth, selectedYear]);

  const fetchPaymentData = async () => {
    try {
      const response = await studentAPI.getPaymentHistory(selectedMonth, selectedYear);
      setPaymentData(response.data.data);
    } catch (err) {
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
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

  const { fees, statistics, paymentHistory } = paymentData || {};

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
    </div>
  );
};

export default Payment;
