import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';


interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

interface Payment {
  method: string;
  amount: number;
  currency: string;
  status: string;
  _id: string;
}

interface Shipping {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  contactPhone: string;
  _id: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  marketplace: string;
  category: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  tax: number;
  shippingCost: number;
  discount: number;
  finalAmount: number;
  placedAt: string;
  payment: Payment;
  shipping: Shipping;
  notes: string;
  lastUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  isRefundEligible: boolean;
  isDigitalService: boolean;
  isPhysicalProduct: boolean;
  isFood: boolean;
  id: string;
}

interface ApiResponse {
  orders?: Order[];
  data?: Order[];
  [key: string]: any;
}

interface OrdersTableProps {
  isLightMode: boolean;
}

export default function OrdersTable({ isLightMode }: OrdersTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://galaxy-backend-imkz.onrender.com/order/v1/orders');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json() as ApiResponse;
        
        // Debug the response structure
        console.log('API Response:', result);
        
        // Check different possible structures for orders in the response
        let orderData: Order[] = [];
        
        if (Array.isArray(result)) {
          // If the response itself is an array
          orderData = result;
        } else if (result.orders && Array.isArray(result.orders)) {
          // If orders are in a property called "orders"
          orderData = result.orders;
        } else if (result.data && Array.isArray(result.data)) {
          // If orders are in a property called "data"
          orderData = result.data;
        } else {
          // If we can't find the orders array, throw an error
          throw new Error('Could not find orders array in API response');
        }
        
        setOrders(orderData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(`Failed to fetch orders: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getProgressWidth = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'completed': return '100%';
      case 'processing': return '60%';
      case 'pending': return '45%';
      case 'delayed': return '30%';
      case 'cancelled': return '15%';
      default: return '0%';
    }
  };

  const getProgressColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-600';
      case 'processing': return 'bg-yellow-400';
      case 'pending': return 'bg-blue-500';
      case 'delayed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} rounded-lg shadow-sm border border-gray-300 p-8 flex justify-center`}>
        <div className="animate-pulse text-center">
          <div className={`flex items-center justify-center min-h-screen ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
        
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
        </div>
        </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} rounded-lg shadow-sm border border-gray-300 p-8`}>
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} rounded-lg shadow-sm border border-gray-300`}>
      <div className={`border-b ${isLightMode ? 'border-gray-200' : 'border-gray-700'} p-4 sm:p-6`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <h3 className={`text-lg font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-3 sm:mb-0`}>ALL ORDERS</h3>
          <div className="w-full sm:w-auto">
            <select 
              className="w-full sm:w-auto bg-gray-200 rounded-lg border border-gray-300 text-black py-2 px-3 text-sm leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${isLightMode ? 'divide-gray-200' : 'divide-gray-700'}`}>
          <thead className={isLightMode ? 'bg-gray-50' : 'bg-gray-800'}>
            <tr>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Order Number
              </th>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Customer ID
              </th>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Market Place
              </th>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Category
              </th>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Status
              </th>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Date
              </th>
              <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                Progress
              </th>
            </tr>
          </thead>
          <tbody className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} divide-y ${isLightMode ? 'divide-gray-200' : 'divide-gray-700'}`}>
            {orders.length > 0 ? (
              orders
                .filter(order => selectedStatus === 'All' || order.status.toLowerCase() === selectedStatus.toLowerCase())
                .map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{order.orderNumber}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{order.customerId}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{order.marketplace}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{order.category}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{formatDate(order.placedAt)}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(order.status)}`}
                          style={{ width: getProgressWidth(order.status) }}
                        >
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}