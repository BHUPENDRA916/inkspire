import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { ClipboardList, DollarSign } from 'lucide-react';

// Poll every 5 seconds
const POLLING_INTERVAL = 5000;

// A small component for displaying stats
const StatCard = ({ title, value, icon, loading }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
    <div className="p-3 rounded-full bg-primary-light/10 text-primary">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {loading ? (
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
    </div>
  </div>
);

const ManagerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const intervalRef = useRef(null); // Use ref for interval

  const fetchOrders = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const { data } = await apiClient.get('/manager/orders');
      setOrders(data);
    } catch (error) {
      if (!isPoll) toast.error('Failed to fetch orders');
      console.error('Poll/Fetch error:', error);
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Only set loading on the first fetch
    if (!stats) setLoadingStats(true);
    try {
      const { data } = await apiClient.get('/manager/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats', error);
      // Don't toast on poll errors
    } finally {
      if (loadingStats) setLoadingStats(false);
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    fetchOrders(); // Initial fetch
    fetchStats(); // Initial stats fetch

    // We can also poll the stats
    intervalRef.current = setInterval(() => {
      fetchOrders(true);
      fetchStats();
    }, POLLING_INTERVAL);

    // Clear interval on unmount
    return () => clearInterval(intervalRef.current);
  }, []);

  // When the list of orders updates (from polling),
  // refresh the selected order if it still exists in the list.
  useEffect(() => {
    if (selectedOrder) {
      const updatedOrderFromList = orders.find(
        (o) => o._id === selectedOrder._id
      );
      if (updatedOrderFromList) {
        // If the order in the list is different, update the selected order
        // This keeps the detail view in sync with the polling
        if (updatedOrderFromList.orderStatus !== selectedOrder.orderStatus) {
          fetchOrderDetails(selectedOrder._id);
        }
      } else {
        // Order is no longer in the list (e.g., very old, or filtered)
        setSelectedOrder(null);
      }
    }
  }, [orders]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const { data } = await apiClient.get(`/manager/orders/${orderId}`);
      setSelectedOrder(data);
    } catch (error) {
      toast.error('Failed to fetch order details');
      setSelectedOrder(null);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedOrder) return;

    try {
      const { data: updatedOrder } = await apiClient.patch(
        `/manager/orders/${selectedOrder._id}/status`,
        { status }
      );

      // Preserve populated fields (student, items) that are missing from the update response
      const mergedOrder = {
        ...updatedOrder,
        student: selectedOrder.student,
        items: selectedOrder.items,
      };

      // Optimistically update UI
      setSelectedOrder(mergedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o._id === updatedOrder._id ? mergedOrder : o))
      );
      toast.success(`Order moved to '${status}'`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Defines the available next-step actions for each status
  const statusActions = {
    pending: [
      { label: 'Accept', status: 'accepted', variant: 'primary' },
      { label: 'Cancel', status: 'cancelled', variant: 'danger' },
    ],
    accepted: [
      { label: 'Start Preparing', status: 'preparing', variant: 'primary' },
      { label: 'Cancel', status: 'cancelled', variant: 'danger' },
    ],
    preparing: [{ label: 'Ready for Pickup', status: 'ready', variant: 'primary' }],
    ready: [{ label: 'Complete Order', status: 'completed', variant: 'primary' }],
    completed: [],
    cancelled: [],
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'accepted': return 'text-blue-600';
      case 'preparing': return 'text-indigo-600';
      case 'ready': return 'text-green-600';
      case 'completed': return 'text-gray-500';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* --- NEW Statistics Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <StatCard
          title="Total Orders"
          value={stats?.orderCount ?? 0}
          icon={<ClipboardList size={20} />}
          loading={loadingStats}
        />
        <StatCard
          title="Total Revenue (Completed)"
          value={`$${stats?.totalRevenue.toFixed(2) ?? '0.00'}`}
          icon={<DollarSign size={20} />}
          loading={loadingStats}
        />
      </div>

      {/* --- Order Dashboard --- */}
      <div className="flex flex-col md:flex-row gap-6 flex-grow min-h-0">
        {/* Order List */}
        <div className="md:w-1/3 h-full overflow-y-auto bg-white rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold p-4 border-b sticky top-0 bg-white">
            Incoming Orders
          </h2>
          {orders.length === 0 ? (
            <p className="p-4 text-gray-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li
                  key={order._id}
                  onClick={() => fetchOrderDetails(order._id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedOrder?._id === order._id ? 'bg-primary-light/10' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">#{order._id.slice(-6)}</span>
                    <span className="font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">{order.student.name}</span>
                    <span
                      className={`font-medium capitalize ${getStatusColor(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Order Details */}
        <div className="md:w-2/3 h-full overflow-y-auto bg-white rounded-lg shadow-sm border p-6">
          {selectedOrder ? (
            <div>
              <h2 className="text-2xl font-bold mb-1">
                Order #{selectedOrder._id.slice(-6)}
              </h2>
              <p className="text-gray-600 mb-4">
                From:{' '}
                <span className="font-medium">{selectedOrder.student.name}</span>
              </p>

              <div className="mb-4">
                <span
                  className={`px-4 py-1 text-lg font-bold rounded-full capitalize ${
                    selectedOrder.orderStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-primary-light/10 text-primary'
                  }`}
                >
                  {selectedOrder.orderStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-500">Total</span>
                  <p className="text-xl font-bold">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-500">Payment</span>
                  <p
                    className={`text-xl font-bold capitalize ${
                      selectedOrder.paymentStatus === 'pending'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {selectedOrder.paymentStatus}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-500">Method</span>
                  <p className="text-xl font-bold capitalize">
                    {selectedOrder.paymentMethod}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">Items</h3>
              <ul className="divide-y divide-gray-200 border rounded-lg mb-6">
                {selectedOrder.items.map((item) => (
                  <li key={item._id} className="flex justify-between p-3">
                    <span className="font-medium">
                      {item.name}{' '}
                      <span className="text-gray-500">x {item.quantity}</span>
                    </span>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-semibold mb-2">Actions</h3>
              <div className="flex gap-4">
                {(statusActions[selectedOrder.orderStatus] || []).map((action) => (
                  <Button
                    key={action.status}
                    onClick={() => handleUpdateStatus(action.status)}
                    variant={action.variant}
                  >
                    {action.label}
                  </Button>
                ))}
                {selectedOrder.orderStatus === 'completed' && (
                  <p className="text-green-600 font-semibold">
                    Order is complete.
                  </p>
                )}
                {selectedOrder.orderStatus === 'cancelled' && (
                  <p className="text-red-600 font-semibold">
                    Order is cancelled.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">
                Select an order to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
