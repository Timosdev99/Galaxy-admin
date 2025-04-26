// utils/formatters.ts

/**
 * Format a date string into a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  /**
   * Format a number as currency
   * @param amount - Number to format as currency
   * @param currency - Currency code (default: USD)
   * @returns Formatted currency string
   */
  export function formatCurrency(amount: number, currency = 'USD'): string {
    if (amount === undefined || amount === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  /**
   * Truncate a string to a specified length
   * @param str - String to truncate
   * @param length - Maximum length
   * @returns Truncated string
   */
  export function truncate(str: string, length = 30): string {
    if (!str) return '';
    if (str.length <= length) return str;
    return `${str.substring(0, length)}...`;
  }