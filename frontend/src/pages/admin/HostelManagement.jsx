import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Users,
  DoorOpen,
  Settings,
  Loader2,
  Bed
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const HostelManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const response = await adminAPI.getHostels();
      setHostels(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch hostels:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    const variants = {
      boys: { variant: 'info', label: 'Boys' },
      girls: { variant: 'danger', label: 'Girls' },
      mixed: { variant: 'warning', label: 'Mixed' }
    };
    return variants[type] || variants.mixed;
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'danger', label: 'Inactive' },
      maintenance: { variant: 'warning', label: 'Maintenance' }
    };
    return variants[status] || variants.active;
  };

  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch = hostel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hostel.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hostel.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || hostel.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Hostels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Hostel Management</h1>
            <p className="text-green-200">Manage all hostels and their facilities</p>
          </div>
          <Button
            leftIcon={Plus}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg"
          >
            Add Hostel
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-lg rounded-2xl p-4 border border-green-500/30">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-300 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hostels by name, code, or address..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all" className="bg-gray-800">All Types</option>
              <option value="boys" className="bg-gray-800">Boys</option>
              <option value="girls" className="bg-gray-800">Girls</option>
              <option value="mixed" className="bg-gray-800">Mixed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hostels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHostels.length > 0 ? (
          filteredHostels.map((hostel) => (
            <div
              key={hostel._id}
              className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Building2 className="h-6 w-6 text-green-300" />
                </div>
                <div className="flex gap-2">
                  <Badge variant={getTypeBadge(hostel.type).variant}>
                    {getTypeBadge(hostel.type).label}
                  </Badge>
                  <Badge variant={getStatusBadge(hostel.status).variant}>
                    {getStatusBadge(hostel.status).label}
                  </Badge>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{hostel.name}</h3>
              <p className="text-green-200 text-sm mb-4">{hostel.code}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-green-200 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{hostel.address}</span>
                </div>
                <div className="flex items-center gap-2 text-green-200 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Warden: {hostel.warden?.name || 'Not Assigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-green-200 text-sm">
                  <DoorOpen className="h-4 w-4" />
                  <span>{hostel.totalRooms || 0} Rooms</span>
                </div>
                <div className="flex items-center gap-2 text-green-200 text-sm">
                  <Bed className="h-4 w-4" />
                  <span>{hostel.totalCapacity || 0} Capacity</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-200 text-sm">Occupancy</span>
                  <span className="text-white font-semibold">
                    {hostel.occupiedRooms || 0}/{hostel.totalRooms || 0}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    style={{ 
                      width: `${hostel.totalRooms ? ((hostel.occupiedRooms || 0) / hostel.totalRooms) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-green-300 hover:text-white hover:bg-white/10"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-blue-300 hover:text-white hover:bg-white/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:text-white hover:bg-white/10"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-lg rounded-2xl p-12 border border-green-500/30 text-center">
              <Building2 className="h-20 w-20 text-green-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Hostels Found</h3>
              <p className="text-green-200 mb-8 max-w-2xl mx-auto">
                {searchTerm || filterType !== 'all'
                  ? 'No hostels match your search criteria. Try adjusting your filters.'
                  : 'Start by adding your first hostel to the system.'}
              </p>
              <Button
                leftIcon={Plus}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
              >
                Add First Hostel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelManagement;
