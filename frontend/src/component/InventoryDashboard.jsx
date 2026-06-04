import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle2, ArrowDownCircle, HardDrive, ShoppingBag, ShieldAlert, BarChart3 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const InventoryDashboard = ({ user }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventory = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/inventory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setInventory(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load inventory database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleConsume = async (itemId) => {
    const input = prompt('Enter quantity to consume:');
    if (!input) return;

    const quantityUsed = Number(input);
    if (!Number.isFinite(quantityUsed) || quantityUsed <= 0) {
      alert('Please enter a valid positive number.');
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/inventory/consume`,
        { itemId, quantityUsed },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      await fetchInventory();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(`Error: ${msg}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const isReadOnly = user?.role === 'Validator';

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.currentStock <= item.thresholdLimit).length;
  const okItems = totalItems - lowStockItems;
  const totalStockQty = inventory.reduce((acc, curr) => acc + curr.currentStock, 0);

  const mockChartMonths = [
    { name: 'Jan', height: 'h-16', val: '$1,200' },
    { name: 'Feb', height: 'h-24', val: '$1,800' },
    { name: 'Mar', height: 'h-28', val: '$2,100' },
    { name: 'Apr', height: 'h-36', val: '$2,900' },
    { name: 'May', height: 'h-20', val: '$1,500' },
    { name: 'Jun', height: 'h-40', val: '$3,400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Inventory Dashboard</h2>
        <p className="text-sm text-slate-500">Real-time telemetry on material availability and procurement safety levels.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-slate-150 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalItems}</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Items</div>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-150 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{lowStockItems}</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Low Stock Alerts</div>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-150 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{okItems}</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Healthy Items</div>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-150 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalStockQty}</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Volume</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 p-6 bg-white border border-slate-150 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Restock Expenditures
            </h3>
            <p className="text-xs text-slate-500">Expenditures from automatic triggers (Jan - Jun).</p>
          </div>
          <div className="flex items-end justify-between h-48 pt-6 border-b border-slate-100">
            {mockChartMonths.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full group relative">
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded font-bold pointer-events-none">
                  {m.val}
                </div>
                <div className={`w-6 ${m.height} bg-blue-500 rounded-t-lg group-hover:bg-blue-600 transition`} />
                <span className="text-[10px] text-slate-400 font-semibold">{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 p-6 bg-white border border-slate-150 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Stock Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 tracking-wider border-b border-slate-150">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Item Name</th>
                  <th className="py-3.5 px-4 font-semibold">Current Stock</th>
                  <th className="py-3.5 px-4 font-semibold">Threshold Limit</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  {!isReadOnly && <th className="py-3.5 px-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={isReadOnly ? 4 : 5} className="py-8 text-center text-slate-400">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => {
                    const isLow = item.currentStock <= item.thresholdLimit;
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-medium text-slate-900">{item.itemName}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{item.currentStock}</td>
                        <td className="py-3.5 px-4 text-slate-500">{item.thresholdLimit}</td>
                        <td className="py-3.5 px-4">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                              Low Stock - PO Auto Drafted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Stock Stable
                            </span>
                          )}
                        </td>
                        {!isReadOnly && (
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleConsume(item._id)}
                              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 font-semibold px-3 py-1 rounded-lg transition text-xs"
                            >
                              <ArrowDownCircle className="w-3.5 h-3.5" />
                              Consume
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
