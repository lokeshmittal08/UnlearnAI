/**
 * Format currency amount with proper formatting
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Format date with time
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Check if the number has 10 digits (US format)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Return original if format doesn't match
  return phone;
};

/**
 * Format account number (show last 4 digits)
 */
export const formatAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) return accountNumber;
  return `****${accountNumber.slice(-4)}`;
};

/**
 * Get status color for Chakra UI
 */
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'green';
    case 'inactive':
      return 'yellow';
    case 'suspended':
      return 'red';
    case 'low':
      return 'green';
    case 'medium':
      return 'yellow';
    case 'high':
      return 'red';
    case 'credit':
      return 'green';
    case 'debit':
      return 'red';
    default:
      return 'gray';
  }
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Get initials from name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
