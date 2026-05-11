import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  Calendar,
  User,
  Bed,
  Download,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Eye,
  Plus,
  Home,
  Mail
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const PaymentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showRoomAssignment, setShowRoomAssignment] = useState(false);
  const [showReschedulePayment, setShowReschedulePayment] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    nextPaymentDate: '',
    paymentFrequency: 'monthly',
    customAmount: '',
    reason: ''
  });
  const [roomAssignmentForm, setRoomAssignmentForm] = useState({
    roomNumber: '',
    roomType: ''
  });
  const [rescheduledPayments, setRescheduledPayments] = useState([]);
  const [showRescheduledList, setShowRescheduledList] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchRescheduledPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPayments();
      console.log('Admin payments response:', response.data);
      console.log('Payments data:', response.data.data);
      setPayments(response.data.data || []);
    } catch (err) {
      console.error('Payments fetch error:', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPayments();
    fetchRescheduledPayments();
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  const handleRoomAssignment = (payment) => {
    setSelectedPayment(payment);
    setShowRoomAssignment(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setSelectedPayment(null);
  };

  const handleCloseRoomAssignment = () => {
    setShowRoomAssignment(false);
    setSelectedPayment(null);
    setRoomAssignmentForm({
      roomNumber: '',
      roomType: ''
    });
  };

  const handleRoomAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminAPI.assignRoom(selectedPayment.transactionId, roomAssignmentForm);
      alert('Room assigned successfully!');
      handleCloseRoomAssignment();
      fetchPayments();
    } catch (err) {
      console.error('Room assignment error:', err);
      alert(err.response?.data?.message || 'Failed to assign room');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedulePayment = (payment) => {
    setSelectedPayment(payment);
    setShowReschedulePayment(true);
  };

  const handleCloseReschedulePayment = () => {
    setShowReschedulePayment(false);
    setSelectedPayment(null);
    setRescheduleForm({
      nextPaymentDate: '',
      paymentFrequency: 'monthly',
      customAmount: '',
      reason: ''
    });
  };

  const fetchRescheduledPayments = async () => {
    try {
      console.log('🔄 Admin fetching rescheduled payments...');
      const response = await adminAPI.getRescheduledPayments();
      console.log('✅ Admin rescheduled payments response:', response.data);
      console.log('📊 Response data:', response.data.data);
      console.log('📏 Data length:', response.data.data?.length || 0);
      console.log('🔍 Response structure:', JSON.stringify(response.data, null, 2));
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('🎯 First rescheduled payment:', response.data.data[0]);
      }
      
      setRescheduledPayments(response.data.data || []);
    } catch (err) {
      console.error('❌ Failed to load rescheduled payments:', err);
      console.error('🔍 Error details:', err.response?.data || err.message);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const rescheduleData = {
        transactionId: selectedPayment.transactionId,
        ...rescheduleForm
      };
      
      const response = await adminAPI.reschedulePayment(rescheduleData);
      console.log('Rescheduling payment response:', response.data);
      
      // Show success message
      alert('Payment rescheduled successfully!');
      handleCloseReschedulePayment();
      fetchPayments(); // Refresh the payments list
      
      // Add delay before fetching rescheduled payments to ensure database is updated
      setTimeout(() => {
        fetchRescheduledPayments(); // Refresh the rescheduled payments list
      }, 1000);
    } catch (error) {
      console.error('Error rescheduling payment:', error);
      alert('Failed to reschedule payment');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = searchTerm === '' || 
      payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                <p className="text-sm text-gray-600">View and manage student payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  Total: <span className="font-bold">{payments.length}</span>
                </p>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Amount: <span className="font-bold">PKR {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Rescheduled Payments Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Rescheduled Payments</h3>
                <p className="text-sm text-gray-500">Manage payment rescheduling for students</p>
              </div>
            </div>
            <Button
              variant="warning"
              onClick={() => setShowRescheduledList(!showRescheduledList)}
              className="flex items-center gap-2"
            >
              {showRescheduledList ? 'Hide' : 'Show'} Rescheduled ({rescheduledPayments.length})
            </Button>
          </div>
        </div>

        {/* Rescheduled Payments List */}
        {showRescheduledList && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {rescheduledPayments.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Rescheduled Payments</h3>
                <p className="text-gray-500">No payments have been rescheduled yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {rescheduledPayments.map((payment) => (
                  <div key={payment.applicationId} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Left Column - Payment Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Payment Rescheduled</h4>
                            <p className="text-sm text-gray-500">Application ID: {payment.applicationId}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Student Name</p>
                              <p className="font-medium">{payment.studentName}</p>
                              <p className="text-xs text-gray-400">{payment.studentEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Room</p>
                              <p className="font-medium">{payment.roomNumber || 'Not Assigned'}</p>
                              <p className="text-xs text-gray-400">{payment.roomType || 'No room type'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Next Payment Date</p>
                              <p className="font-medium">{new Date(payment.nextPaymentDate).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-400 capitalize">{payment.paymentFrequency}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Amount</p>
                              <p className="font-medium text-yellow-600">PKR {payment.customAmount?.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">Original: PKR {payment.originalAmount?.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Reschedule Reason</p>
                              <p className="font-medium">{payment.rescheduleReason}</p>
                              <p className="text-xs text-gray-400">Rescheduled: {new Date(payment.rescheduledAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Card on File</p>
                              <p className="font-medium">**** **** **** {payment.cardLastFour}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, transaction ID, or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No payments have been made yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => {
                console.log('Rendering payment:', payment);
                console.log('Payment studentName:', payment.studentName);
                console.log('Payment studentEmail:', payment.studentEmail);
                console.log('Payment department:', payment.department);
                console.log('Payment rollNumber:', payment.rollNumber);
                return (
                <div key={payment.transactionId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left Column - Payment Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Payment Completed</h4>
                          <p className="text-sm text-gray-500">{payment.transactionId}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Student Name</p>
                            <p className="font-medium">{payment.studentName}</p>
                            <p className="text-xs text-gray-400">{payment.studentEmail || 'No email'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Room Number</p>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{payment.roomNumber || 'Not Assigned'}</p>
                              
                            </div>
                            <p className="text-xs text-gray-400">{payment.roomType || 'No room type'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Payment Date</p>
                            <p className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400">{payment.transactionId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-medium text-green-600">PKR {payment.amount?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Department</p>
                            <p className="font-medium">{payment.department || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium">{payment.studentEmail || 'No email'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Roll Number</p>
                            <p className="font-medium">{payment.rollNumber || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Badge variant="success" size="sm">
                        Completed
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(payment)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Receipt
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleReschedulePayment(payment)}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Reschedule Payment
                      </Button>
                      {!payment.roomNumber && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRoomAssignment(payment)}
                          className="flex items-center gap-2"
                        >
                          <Home className="h-4 w-4" />
                          Assign Room
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
               )})}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Payment Receipt</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseReceipt}
                >
                  <Plus className="h-5 w-5 rotate-45" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold text-green-800">Payment Completed</h3>
                    <p className="text-sm text-green-600">Transaction ID: {selectedPayment.transactionId}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Student Name</p>
                    <p className="font-medium text-gray-900">{selectedPayment.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedPayment.studentEmail || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Department</p>
                    <p className="font-medium text-gray-900">{selectedPayment.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Roll Number</p>
                    <p className="font-medium text-gray-900">{selectedPayment.rollNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Room Number</p>
                    <p className="font-medium text-gray-900">{selectedPayment.roomNumber || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Date</p>
                    <p className="font-medium text-gray-900">{new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-lg text-gray-600">Total Amount Paid</p>
                    <p className="text-2xl font-bold text-green-600">PKR {selectedPayment.amount?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Assignment Modal */}
      {showRoomAssignment && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Assign Room</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseRoomAssignment}
                >
                  <Plus className="h-5 w-5 rotate-45" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleRoomAssignmentSubmit} className="p-6">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Student Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedPayment.studentName}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedPayment.studentEmail || 'Not provided'}</p>
                    <p className="text-sm"><span className="font-medium">Department:</span> {selectedPayment.department || 'Not specified'}</p>
                    <p className="text-sm"><span className="font-medium">Roll Number:</span> {selectedPayment.rollNumber || 'Not specified'}</p>
                    <p className="text-sm"><span className="font-medium">Amount Paid:</span> PKR {selectedPayment.amount?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
                  <input
                    type="text"
                    placeholder="e.g., A-101"
                    value={roomAssignmentForm.roomNumber}
                    onChange={(e) => setRoomAssignmentForm({...roomAssignmentForm, roomNumber: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
                  <select
                    value={roomAssignmentForm.roomType}
                    onChange={(e) => setRoomAssignmentForm({...roomAssignmentForm, roomType: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select room type</option>
                    <option value="single">Single Room</option>
                    <option value="double">Double Room</option>
                    <option value="triple">Triple Room</option>
                    <option value="quad">Quad Room</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseRoomAssignment}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? <Spinner size="sm" /> : 'Assign Room'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Payment Modal */}
      {showReschedulePayment && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Reschedule Payment</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseReschedulePayment}
                >
                  <Plus className="h-5 w-5 rotate-45" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Current Payment Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Student:</span> {selectedPayment.studentName}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedPayment.studentEmail}</p>
                    <p className="text-sm"><span className="font-medium">Room:</span> {selectedPayment.roomNumber || 'Not assigned'}</p>
                    <p className="text-sm"><span className="font-medium">Last Payment:</span> PKR {selectedPayment.amount?.toLocaleString()}</p>
                    <p className="text-sm"><span className="font-medium">Payment Date:</span> {new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next Payment Date</label>
                  <input
                    type="date"
                    value={rescheduleForm.nextPaymentDate}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, nextPaymentDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Frequency</label>
                  <select
                    value={rescheduleForm.paymentFrequency}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, paymentFrequency: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semester">Semester</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-Time</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (PKR)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={rescheduleForm.customAmount}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, customAmount: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rescheduling</label>
                  <textarea
                    placeholder="Enter reason for payment rescheduling"
                    value={rescheduleForm.reason}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, reason: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleCloseReschedulePayment}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    className="flex-1"
                  >
                    Reschedule Payment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentManagement;
