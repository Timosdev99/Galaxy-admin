interface StatusBadgeProps {
    status: string;
  }
  
  export default function StatusBadge({ status }: StatusBadgeProps) {
    const getStatusColor = (): string => {
      switch(status.toLowerCase()) {
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'processing':
          return 'bg-yellow-100 text-yellow-800';
        case 'pending':
          return 'bg-blue-100 text-blue-800';
        case 'delayed':
          return 'bg-gray-100 text-gray-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
  
    const getStatusText = (): string => {
      // Capitalize first letter
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };
  
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    );
  }