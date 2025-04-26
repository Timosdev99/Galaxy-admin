'use client'

import { useState } from "react";


type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';


interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  shipping?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string | Date;
  };
  notes?: string;
}

interface UpdateOrderModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: (orderId: string, status: string) => Promise<void>;
}

// defining form data interface 
interface FormData {
  status: OrderStatus;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  notes: string;
}

export default function UpdateOrderModal({ order, onClose, onUpdate }: UpdateOrderModalProps) {
  const [formData, setFormData] = useState<FormData>({
    status: order.status,
    trackingNumber: order.shipping?.trackingNumber || "",
    carrier: order.shipping?.carrier || "",
    estimatedDelivery: order.shipping?.estimatedDelivery ? 
      new Date(order.shipping.estimatedDelivery).toISOString().split('T')[0] : "",
    notes: order.notes || "",
  });
  const [loading, setLoading] = useState(false);

  // defining status option to resolve types error 
  const statusOptions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: ["refunded"],
    cancelled: [],
    refunded: []
  };

  const availableStatusOptions = statusOptions[order.status] || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(order.id, formData.status);
      onClose();
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Update Order</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
              <input
                type="text"
                value={order.orderNumber}
                disabled
                className="w-full bg-gray-100 border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
              <input
                type="text"
                value={order.status}
                disabled
                className="w-full bg-gray-100 border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value={order.status}>Keep as {order.status}</option>
                {availableStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {(order.status === "processing" || formData.status === "shipped") && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    name="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="Enter tracking number"
                  />
                </div>
               
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                  <input
                    type="text"
                    name="carrier"
                    value={formData.carrier}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="Enter carrier name"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date</label>
                  <input
                    type="date"
                    name="estimatedDelivery"
                    value={formData.estimatedDelivery}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                rows={3}
                placeholder="Add any additional notes"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}