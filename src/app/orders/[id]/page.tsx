
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../component/layout/dashboardLayout";
import ProtectedRoute from "../../protectedRoutes";
import { formatDate, formatCurrency } from "../../utils/formatter";
import axios from "axios";
import Link from "next/link";
import UpdateOrderModal from "../../component/orders/UpdateOrdersModal";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/authcontext";



interface OrderItem {
  name: string;
  productId: string;
  price: number;
  quantity: number;
}

interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactPhone: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

interface PaymentInfo {
  status: 'pending' | 'received' | 'completed' | 'failed' | 'refunded';
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  placedAt: string;
  lastUpdatedAt: string;
  items: OrderItem[];
  totalAmount: number;
  shippingCost: number;
  finalAmount: number;
  shipping: ShippingInfo;
  payment: PaymentInfo;
  marketplace: string;
  category: string;
  notes?: string; // Optional field
}

interface UpdateOrderModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: (orderId: string, newStatus: string) => Promise<void>;
}

const {token, user} = useAuth()

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get(`https://galaxy-backend-imkz.onrender.com/order/v1//orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrder(response.data.order);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string): Promise<void> => {
    try {
      await axios.patch(
        "https://galaxy-backend-imkz.onrender.com/order/v1/orders/update",
        { orderId, status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Order status updated successfully");
      fetchOrder(); // Refresh order after update
      setShowUpdateModal(false);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentConfirm = async (): Promise<void> => {
    if (!order) return;
    
    try {
      const adminId = localStorage.getItem("userId");
      await axios.post(
        "https://galaxy-backend-imkz.onrender.com/order/v1/orders/confirm-payment",
        { orderId: order.id, adminId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Payment confirmed successfully");
      fetchOrder(); // Refresh order after confirmation
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      toast.error("Failed to confirm payment");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-gray-900">Order not found</h2>
              <p className="mt-2 text-gray-500">
                The order you are looking for does not exist or you may not have permission to view it.
              </p>
              <Link href="/orders" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                Back to Orders
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    received: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Link href="/orders" className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Orders
              </Link>
              <h1 className="text-2xl font-bold mt-2">Order #{order.orderNumber}</h1>
            </div>
            <div className="flex space-x-2">
              {order.payment.status === "pending" && (
                <button
                  onClick={handlePaymentConfirm}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Confirm Payment
                </button>
              )}
              <button
                onClick={() => setShowUpdateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Order
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-lg font-medium">Order Status</h2>
                  <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full mt-1 ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-medium">Payment Status</h2>
                  <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full mt-1 ${paymentStatusColors[order.payment.status]}`}>
                    {order.payment.status}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-medium">Date Placed</h2>
                  <p className="text-gray-700 mt-1">{formatDate(order.placedAt)}</p>
                </div>
                <div>
                  <h2 className="text-lg font-medium">Last Updated</h2>
                  <p className="text-gray-700 mt-1">{formatDate(order.lastUpdatedAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium mb-2">Customer Information</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2"><span className="font-medium">Customer ID:</span> {order.customerId}</p>
                    <p className="mb-2"><span className="font-medium">Marketplace:</span> {order.marketplace}</p>
                    <p className="mb-2"><span className="font-medium">Category:</span> {order.category}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-2">Shipping Information</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-1">{order.shipping.address}</p>
                    <p className="mb-1">{`${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}`}</p>
                    <p className="mb-1">{order.shipping.country}</p>
                    <p className="mb-2"><span className="font-medium">Phone:</span> {order.shipping.contactPhone}</p>
                    
                    {order.shipping.trackingNumber && (
                      <p className="mb-2"><span className="font-medium">Tracking:</span> {order.shipping.trackingNumber}</p>
                    )}
                    
                    {order.shipping.carrier && (
                      <p className="mb-2"><span className="font-medium">Carrier:</span> {order.shipping.carrier}</p>
                    )}
                    
                    {order.shipping.estimatedDelivery && (
                      <p className="mb-2"><span className="font-medium">Est. Delivery:</span> {formatDate(order.shipping.estimatedDelivery)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Order Items</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">Subtotal</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">Shipping</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{formatCurrency(order.shippingCost)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{formatCurrency(order.finalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-2">Notes</h2>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {showUpdateModal && (
          <UpdateOrderModal
            order={order}
            onClose={() => setShowUpdateModal(false)}
            onUpdate={handleStatusUpdate}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}