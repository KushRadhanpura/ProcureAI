import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Tag, Plus, Users, ShieldAlert, Award } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const VendorManagement = ({ user }) => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', averagePrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVendors = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/vendors`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setVendors(response.data.vendors || []);
    } catch (err) {
      setError('Could not fetch vendors. Please check network connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/vendors`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setFormData({ name: '', email: '', phone: '', address: '', averagePrice: 0 });
      fetchVendors();
    } catch (err) {
      alert('Error adding vendor: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isReadOnly = user?.role === 'Validator';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-sans">Vendor Directory</h2>
        <p className="text-sm text-slate-500">Add, track, and manage verified B2B partners and supply price averages.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {!isReadOnly && (
          <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-150 h-fit">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Add Vendor Profile
            </h3>
            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-slate-800 bg-white"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-slate-800 bg-white"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-slate-800 bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-slate-800 bg-white"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Average Quoted Price ($)"
                  value={formData.averagePrice || ''}
                  onChange={(e) => setFormData({ ...formData, averagePrice: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-slate-800 bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-100 transition text-sm"
              >
                Save Profile
              </button>
            </form>
          </div>
        )}

        <div className={isReadOnly ? 'lg:col-span-12' : 'lg:col-span-8'}>
          {vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Users className="w-8 h-8 text-slate-350 mb-2" />
              <p className="text-slate-400 text-sm">No registered vendors found.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {vendors.map((vendor) => {
                const initials = vendor.name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2);
                return (
                  <div
                    key={vendor._id}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 hover:shadow-sm transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{vendor.name}</h4>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                            <Award className="w-3 h-3" />
                            Verified Partner
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                        {vendor.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{vendor.email}</span>
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                        {vendor.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{vendor.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {vendor.averagePrice > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1 font-medium">
                          <Tag className="w-3.5 h-3.5" />
                          Catalog Avg
                        </span>
                        <span className="font-bold text-slate-800">${vendor.averagePrice}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorManagement;
