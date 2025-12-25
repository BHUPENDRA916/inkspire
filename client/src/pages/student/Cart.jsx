import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus } from 'lucide-react';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartTotal,
} from '../../store/cartSlice';
import { selectUser } from '../../store/authSlice'; // Import the selector

const Cart = () => {
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // FIX: Replaced useAuth() with useSelector(selectUser)
  const user = useSelector(selectUser);
  // ---

  // useSelector calls are now correct
  const { cartItems, canteen } = useSelector((state) => state.cart);
  const cartTotal = useSelector(selectCartTotal);


  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order.');
      navigate('/login');
      return;
    }

    setLoading(true);

    if (paymentMethod === 'razorpay') {
      try {
        // 1. Create Order on Server
        const { data: order } = await apiClient.post('/payment/create-order', {
          amount: cartTotal,
        });

        // 2. Initialize Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'CampusEats',
          description: `Order from ${canteen.name}`,
          order_id: order.id,
          handler: async function (response) {
            try {
              // 3. Verify Payment
              const { data: verifyData } = await apiClient.post(
                '/payment/verify-payment',
                {
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }
              );

              if (verifyData.success) {
                // 4. Place Actual Order
                const orderData = {
                  canteenId: canteen._id,
                  orderItems: cartItems.map((item) => ({
                    menuItemId: item._id,
                    quantity: item.quantity,
                  })),
                  paymentMethod: 'razorpay',
                };

                const { data: newOrder } = await apiClient.post(
                  '/student/orders',
                  orderData
                );

                toast.success('Payment successful! Order placed.');
                dispatch(clearCart());
                navigate(`/order/${newOrder._id}`);
              } else {
                toast.error('Payment verification failed.');
              }
            } catch (error) {
              toast.error('Payment verification failed.');
              console.error(error);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#4A64F0',
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
        setLoading(false); // Stop loading as modal is open
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Failed to initiate payment'
        );
        console.error(error);
        setLoading(false);
      }
      return;
    }

    // Standard Flow (Cash)
    try {
      const orderData = {
        canteenId: canteen._id,
        orderItems: cartItems.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod,
      };

      const { data: newOrder } = await apiClient.post(
        '/student/orders',
        orderData
      );

      toast.success('Order placed successfully!');
      dispatch(clearCart());

      // Navigate to the order status page
      navigate(`/order/${newOrder._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-semibold text-gray-800">Your cart is empty</h2>
        <Button onClick={() => navigate('/')} className="mt-4">
          Browse Canteens
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Cart</h1>
      <h2 className="text-xl font-semibold text-primary mb-6">
        From: {canteen?.name}
      </h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex-grow">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-primary font-medium">
                ${item.price.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(updateQuantity({ itemId: item._id, quantity: item.quantity - 1 }))}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => dispatch(updateQuantity({ itemId: item._id, quantity: item.quantity + 1 }))}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => dispatch(removeFromCart(item._id))}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">Service Fee</span>
          <span className="font-medium">$0.00</span>
        </div>
        <hr className="my-2"/>
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded-lg has-[:checked]:bg-primary-light/10 has-[:checked]:border-primary">
            <input
              type="radio"
              name="paymentMethod"
              value="razorpay"
              checked={paymentMethod === 'razorpay'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="ml-3 font-medium text-gray-700">Pay with Razorpay (Cards/NetBanking)</span>
          </label>
          <label className="flex items-center p-3 border rounded-lg has-[:checked]:bg-primary-light/10 has-[:checked]:border-primary">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="ml-3 font-medium text-gray-700">Pay with Cash at Counter</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handlePlaceOrder}
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading
            ? 'Processing...'
            : paymentMethod === 'razorpay'
            ? 'Proceed to Pay'
            : 'Place Order (Pay Cash)'}
        </Button>
        <p className="text-sm text-center text-gray-500">
          {paymentMethod === 'razorpay'
            ? 'You will be redirected to the Razorpay secure payment gateway.'
            : 'You will pay at the counter when you pick up your order.'}
        </p>
      </div>
    </div>
  );
};

export default Cart;
