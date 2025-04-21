"use client"


import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';


interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  ordersByPaymentMethod: Record<string, number>;
  ordersByMarketplace: Record<string, number>;
  revenueByMarketplace: Record<string, number>;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  marketplace: string;
  status: string;
  finalAmount: number;
  placedAt: string;
  payment: {
    method: string;
    status: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    contactPhone: string;
  };
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Only access localStorage client-side
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        // Fetch analytics data
        const analyticsResponse = await axios.get('https://galaxy-backend-imkz.onrender.com/order/v1/orders/analytics', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch all orders for the recent orders table
        const ordersResponse = await axios.get('/api/orders/all', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAnalytics(analyticsResponse.data.analytics);
        // Take just the 10 most recent orders
        setRecentOrders(ordersResponse.data.allOrders.slice(0, 10));
        
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        // Handle unauthorized access
        if (error.response && error.response.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only run on client-side
    if (typeof window !== 'undefined') {
      fetchDashboardData();
    }
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {loading ? (
        
          <div className="flex items-center justify-center min-h-screen">
        
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
        </div>
        </div>
    
      ) : (
        <>     
          {/* Analytics Cards */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 3, 
              mb: 4 
            }}
          >
            <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h5">
                    {analytics?.totalOrders || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Completed Orders
                  </Typography>
                  <Typography variant="h5">
                    {analytics?.completedOrders || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(analytics?.totalRevenue || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Orders
                  </Typography>
                  <Typography variant="h5">
                    {analytics?.ordersByStatus?.pending || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
          
          {/* Order Status Distribution */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Orders by Status
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {analytics && Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                    <Chip 
                      key={status}
                      label={`${status}: ${count}`}
                      color={getStatusColor(status)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Orders by Marketplace
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {analytics && Object.entries(analytics.ordersByMarketplace).map(([marketplace, count]) => (
                    <Chip 
                      key={marketplace}
                      label={`${marketplace}: ${count}`}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
          
          {/* Recent Orders */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Recent Orders
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => router.push('/admin/orders')}
              >
                View All Orders
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Marketplace</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{formatDate(order.placedAt)}</TableCell>
                      <TableCell>{order.marketplace}</TableCell>
                      <TableCell>{formatCurrency(order.finalAmount)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status} 
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => router.push(`/admin/orders/${order._id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;