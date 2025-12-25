import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/student/orders');
        setOrders(data);
      } catch (error) {
        toast.error('Failed to fetch order history');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/order/${order._id}`}
              className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-primary">
                    {order.canteen.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: #{order._id.slice(-6)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <p className="text-lg font-bold mt-1">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;