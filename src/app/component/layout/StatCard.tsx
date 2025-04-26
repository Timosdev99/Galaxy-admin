
export default function StatCard({ 
    title, 
    value, 
    subtitle, 
    trend, 
    trendValue, 
    icon: Icon, 
    iconText, 
    isLightMode 
  }: any) {
    const getTrendStyles = () => {
      if (trend === 'up') return 'bg-green-50 text-green-600';
      if (trend === 'down') return 'bg-green-50 text-green-600'; 
      return 'bg-blue-50 text-blue-600';
    };
  
    return (
      <div className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} p-4 sm:p-6 rounded-lg shadow-sm border border-gray-300`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${isLightMode ? 'text-gray-500' : 'text-gray-300'} text-sm font-medium`}>{title}</h3>
          {trend && (
            <span className={`p-2 ${getTrendStyles()} rounded`}>
              <span className="text-xs font-medium">
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-baseline">
          <p className={`text-2xl sm:text-3xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{value}</p>
          <p className={`ml-2 text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{subtitle}</p>
        </div>
        {Icon && (
          <div className="mt-4 flex items-center text-xs sm:text-sm">
            <Icon className={`h-4 w-4 ${isLightMode ? 'text-gray-400' : 'text-gray-300'} mr-1`} />
            <span className={`${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{iconText}</span>
          </div>
        )}
      </div>
    );
  }