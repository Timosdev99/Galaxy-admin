
import { formatDate, formatCurrency } from "../../utils/formatter";

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Order Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Order Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><span className="font-medium">Order Number:</span> {order.orderNumber}</p>
                <p className="mb-2"><span className="font-medium">Date:</span> {formatDate(order.placedAt)}</p>
                <p className="mb-2"><span className="font-medium">Marketplace:</span> {order.marketplace}</p>
                <p className="mb-2"><span className="font-medium">Category:</span> {order.category}</p>
                <p className="mb-2"><span className="font-medium">Status:</span> {order.status}</p>
                <p className="mb-2"><span className="font-medium">Last Updated:</span> {formatDate(order.lastUpdatedAt)}</p>
                {order.notes && <p className="mb-2"><span className="font-medium">Notes:</span> {order.notes}</p>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Payment Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><span className="font-medium">Method:</span> {order.payment.method}</p>
                <p className="mb-2"><span className="font-medium">Status:</span> {order.payment.status}</p>
                <p className="mb-2"><span className="font-medium">Amount:</span> {formatCurrency(order.payment.amount)}</p>
                <p className="mb-2"><span className="font-medium">Currency:</span> {order.payment.currency}</p>
                {order.payment.transactionId && (
                  <p className="mb-2"><span className="font-medium">Transaction ID:</span> {order.payment.transactionId}</p>
                )}
                {order.payment.confirmedBy && (
                  <p className="mb-2"><span className="font-medium">Confirmed By:</span> {order.payment.confirmedBy}</p>
                )}
                {order.payment.confirmationDate && (
                  <p className="mb-2"><span className="font-medium">Confirmation Date:</span> {formatDate(order.payment.confirmationDate)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2"><span className="font-medium">Address:</span> {order.shipping.address}</p>
              <p className="mb-2"><span className="font-medium">City:</span> {order.shipping.city}</p>
              <p className="mb-2"><span className="font-medium">State:</span> {order.shipping.state}</p>
              <p className="mb-2"><span className="font-medium">Country:</span> {order.shipping.country}</p>
              <p className="mb-2"><span className="font-medium">Postal Code:</span> {order.shipping.postalCode}</p>
              <p className="mb-2"><span className="font-medium">Contact Phone:</span> {order.shipping.contactPhone}</p>
              {order.shipping.trackingNumber && (
                <p className="mb-2"><span className="font-medium">Tracking Number:</span> {order.shipping.trackingNumber}</p>
              )}
              {order.shipping.carrier && (
                <p className="mb-2"><span className="font-medium">Carrier:</span> {order.shipping.carrier}</p>
              )}
              {order.shipping.estimatedDelivery && (
                <p className="mb-2"><span className="font-medium">Estimated Delivery:</span> {formatDate(order.shipping.estimatedDelivery)}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Order Items</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                    <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                    <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item: any, index: any) => (
                    <tr key={index}>
                      <td className="py-2 text-sm text-gray-900">{item.productId}</td>
                      <td className="py-2 text-sm text-gray-900">{item.name}</td>
                      <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(item.price)}</td>
                      <td className="py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="py-2 text-sm text-gray-900 text-right">{item.discount ? formatCurrency(item.discount) : '-'}</td>
                      <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(item.price * item.quantity - (item.discount || 0))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200">
                  <tr>
                    <td colSpan={5} className="py-2 text-right font-medium">Subtotal:</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(order.totalAmount)}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="py-2 text-right font-medium">Shipping Cost:</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(order.shippingCost)}</td>
                  </tr>
                  {order.tax > 0 && (
                    <tr>
                      <td colSpan={5} className="py-2 text-right font-medium">Tax:</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(order.tax)}</td>
                    </tr>
                  )}
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan={5} className="py-2 text-right font-medium">Discount:</td>
                      <td className="py-2 text-right font-medium">-{formatCurrency(order.discount)}</td>
                    </tr>
                  )}
                  <tr className="border-t">
                    <td colSpan={5} className="py-2 text-right text-lg font-bold">Final Amount:</td>
                    <td className="py-2 text-right text-lg font-bold">{formatCurrency(order.finalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}