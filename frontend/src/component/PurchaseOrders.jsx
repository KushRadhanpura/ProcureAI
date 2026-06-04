import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FileUp, Check, Send, Inbox, ShieldAlert, Award, ChevronDown, ChevronUp, Mail } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const PurchaseOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [parsingDoc, setParsingDoc] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [mappedOrder, setMappedOrder] = useState({ itemId: '', vendorId: '', quantity: 1, quotedPrice: 0 });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const authHeaders = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const [orderRes, vendorRes, invRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/purchase-orders`, authHeaders),
        axios.get(`${API_BASE_URL}/api/vendors`, authHeaders),
        axios.get(`${API_BASE_URL}/api/inventory`, authHeaders),
      ]);

      setOrders(orderRes.data.orders || []);
      const vendorList = vendorRes.data.vendors || [];
      const inventoryList = invRes.data.data || [];

      setVendors(vendorList);
      setInventory(inventoryList);

      if (vendorList.length > 0 && inventoryList.length > 0) {
        setMappedOrder({
          itemId: inventoryList[0]._id,
          vendorId: vendorList[0]._id,
          quantity: 1,
          quotedPrice: 0,
        });
      }
    } catch (err) {
      setError('Could not connect to services. Verify servers are running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (orderId, currentStatus, draftText) => {
    let nextStatus = 'Negotiating';
    if (currentStatus === 'Draft') nextStatus = 'Negotiating';
    else if (currentStatus === 'Negotiating') nextStatus = 'Confirmed';
    else if (currentStatus === 'Confirmed') nextStatus = 'Delivered';

    try {
      await axios.put(
        `${API_BASE_URL}/api/purchase-orders/${orderId}`,
        { status: nextStatus, aiDraft: draftText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchData();
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setParsingDoc(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64Data = event.target.result;
        const response = await axios.post(
          `${API_BASE_URL}/api/purchase-orders/parse-pdf`,
          { fileData: base64Data, fileName: file.name },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (response.data.success) {
          const parsed = response.data;
          setParsedData(parsed);

          let matchedItemId = inventory[0]?._id || '';
          let matchedVendorId = vendors[0]?._id || '';

          const foundItem = inventory.find((item) =>
            item.itemName.toLowerCase().includes(parsed.itemName.toLowerCase())
          );
          if (foundItem) matchedItemId = foundItem._id;

          const foundVendor = vendors.find((v) =>
            v.name.toLowerCase().includes(parsed.vendorName.toLowerCase())
          );
          if (foundVendor) matchedVendorId = foundVendor._id;

          setMappedOrder({
            itemId: matchedItemId,
            vendorId: matchedVendorId,
            quantity: parsed.quantity || 10,
            quotedPrice: parsed.quotedPrice || 100,
          });
        } else {
          alert('Could not parse document structure. Using manual mapping.');
        }
      } catch (err) {
        alert('File upload or analysis failed: ' + (err.response?.data?.message || err.message));
      } finally {
        setParsingDoc(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateParsedOrder = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/purchase-orders`, mappedOrder, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setParsedData(null);
      fetchData();
    } catch (err) {
      alert('Error creating order: ' + (err.response?.data?.message || err.message));
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Purchase Orders</h2>
          <p className="text-sm text-slate-500">Monitor active replenishment negotiations and review RAG-generated vendor communications.</p>
        </div>
        {!isReadOnly && (
          <div className="relative">
            <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition">
              <FileUp className="w-4 h-4" />
              {parsingDoc ? 'Analyzing Document...' : 'Import Quote Doc'}
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={parsingDoc}
              />
            </label>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {parsedData && (
        <div className="p-6 bg-slate-50 border border-blue-100 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            Verify AI Extracted Quote Fields
          </h3>
          <form onSubmit={handleCreateParsedOrder} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Select Item</label>
              <select
                value={mappedOrder.itemId}
                onChange={(e) => setMappedOrder({ ...mappedOrder, itemId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm"
              >
                {inventory.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.itemName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Select Vendor</label>
              <select
                value={mappedOrder.vendorId}
                onChange={(e) => setMappedOrder({ ...mappedOrder, vendorId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm"
              >
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={mappedOrder.quantity}
                onChange={(e) => setMappedOrder({ ...mappedOrder, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Quoted Price ($)</label>
              <input
                type="number"
                value={mappedOrder.quotedPrice}
                onChange={(e) => setMappedOrder({ ...mappedOrder, quotedPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                required
              />
            </div>
            <div className="col-span-1 sm:col-span-2 md:col-span-4 flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => setParsedData(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Confirm Order
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs uppercase bg-slate-50 text-slate-500 tracking-wider border-b border-slate-150">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Item</th>
              <th className="py-3.5 px-4 font-semibold">Vendor</th>
              <th className="py-3.5 px-4 font-semibold">Quantity</th>
              <th className="py-3.5 px-4 font-semibold">Quoted Price</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-450">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No purchase orders registered.</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrderId === order._id;
                return (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-900">{order.itemId?.itemName || 'Deleted Item'}</td>
                      <td className="py-3.5 px-4 text-slate-700">{order.vendorId?.name || 'Deleted Vendor'}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{order.quantity}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">${order.quotedPrice || '0'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            order.status === 'Draft'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : order.status === 'Negotiating'
                              ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse'
                              : order.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-3">
                        {order.aiDraft && (
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            AI Negotiation
                          </button>
                        )}
                        {!isReadOnly && order.status !== 'Delivered' && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, order.status, order.aiDraft)}
                            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition text-xs"
                          >
                            {order.status === 'Draft' && (
                              <>
                                <Send className="w-3 h-3 text-blue-500" />
                                Start Negotiation
                              </>
                            )}
                            {order.status === 'Negotiating' && (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                Approve Quote
                              </>
                            )}
                            {order.status === 'Confirmed' && (
                              <>
                                <Check className="w-3 h-3 text-slate-500" />
                                Deliver
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && order.aiDraft && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="py-4 px-6">
                          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-4xl shadow-sm">
                            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  RAG Email Agent Composer
                                </span>
                              </div>
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold uppercase">
                                draft sequence
                              </span>
                            </div>
                            <div className="p-4 space-y-2 border-b border-slate-100 text-xs text-slate-600 bg-slate-50/40">
                              <div>
                                <span className="font-semibold text-slate-400">From:</span> auto-agent@procureai.net
                              </div>
                              <div>
                                <span className="font-semibold text-slate-400">To:</span> {order.vendorId?.email || 'sales@vendor.com'}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-400">Subject:</span> Stock replenishment negotiation request - ProcureAI Enterprise
                              </div>
                            </div>
                            <div className="p-5 font-mono text-xs text-slate-650 leading-relaxed bg-white border-b border-slate-100 whitespace-pre-wrap">
                              {order.aiDraft}
                            </div>
                            {order.status === 'Draft' && !isReadOnly && (
                              <div className="p-3 bg-slate-50/50 flex justify-end">
                                <button
                                  onClick={() => handleStatusUpdate(order._id, order.status, order.aiDraft)}
                                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Approve & Send Negotiation Email
                                </button>
                              </div>
                            )}
                            {order.status === 'Negotiating' && !isReadOnly && (
                              <div className="p-4 bg-blue-50/20 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                                  <span className="text-xs font-semibold text-blue-700">
                                    AI is negotiating best price... Progress: 75%
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleStatusUpdate(order._id, order.status, order.aiDraft)}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Accept & Confirm Vendor Deal
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrders;
