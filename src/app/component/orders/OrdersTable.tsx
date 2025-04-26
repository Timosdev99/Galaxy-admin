'use client'
import { useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import UpdateOrderModal from "./UpdateOrdersModal";
import { formatDate, formatCurrency } from "../../utils/formatter";

// Define status types
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
type PaymentStatus = 'pending' | 'received' | 'completed' | 'failed' | 'refunded';

// Define order interface
interface Order {
  id: string;
  orderNumber: string;
  placedAt: string | Date;
  customerId: string;
  marketplace: string;
  finalAmount: number;
  status: OrderStatus;
  payment: {
    status: PaymentStatus;
  };
}

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
  onPaymentConfirm: (orderId: string) => Promise<void>;
}

export default function OrdersTable({ orders, loading, onStatusUpdate, onPaymentConfirm }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateOrder, setUpdateOrder] = useState<Order | null>(null);

  const statusColors: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  const paymentStatusColors: Record<PaymentStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    received: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleUpdate = (order: Order) => {
    setUpdateOrder(order);
  };

  const handleConfirmPayment = async (orderId: string) => {
    await onPaymentConfirm(orderId);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marketplace
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.placedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.marketplace}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(order.finalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status as OrderStatus] || "bg-gray-100 text-gray-800"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[order.payment.status as PaymentStatus] || "bg-gray-100 text-gray-800"}`}>
                      {order.payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUpdate(order)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Update
                      </button>
                      {order.payment.status === "pending" && (
                        <button
                          onClick={() => handleConfirmPayment(order.id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Confirm Payment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
      
      {updateOrder && (
        <UpdateOrderModal 
          order={updateOrder} 
          onClose={() => setUpdateOrder(null)}
          onUpdate={onStatusUpdate}
        />
      )}
    </div>
  );
}