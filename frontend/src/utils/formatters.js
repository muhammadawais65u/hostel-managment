// Date formatter
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

// Time formatter
export const formatTime = (date) => {
  if (!date) return 'N/A';

  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// DateTime formatter
export const formatDateTime = (date) => {
  if (!date) return 'N/A';

  return `${formatDate(date)} at ${formatTime(date)}`;
};

// Currency formatter (PKR)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'PKR 0';

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Number formatter with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';

  return num.toLocaleString('en-IN');
};

// Status color mapping
export const getStatusColor = (status) => {
  const colors = {
    // Application status
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    waitlisted: 'blue',
    none: 'gray',

    // Complaint status
    submitted: 'blue',
    under_review: 'yellow',
    in_progress: 'orange',
    resolved: 'green',
    closed: 'gray',

    // Fee status
    paid: 'green',
    unpaid: 'red',
    partial: 'orange',
    waived: 'purple',
    refunded: 'blue',

    // Room status
    available: 'green',
    occupied: 'blue',
    maintenance: 'orange',
    reserved: 'purple',
  };

  return colors[status?.toLowerCase()] || 'gray';
};

// Priority color mapping
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'blue',
    medium: 'yellow',
    high: 'orange',
    urgent: 'red',
  };

  return colors[priority?.toLowerCase()] || 'gray';
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength).trim() + '...';
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Snake case to Title case
export const snakeToTitle = (str) => {
  if (!str) return '';

  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};

// Kebab case to Title case
export const kebabToTitle = (str) => {
  if (!str) return '';

  return str
    .split('-')
    .map(word => capitalize(word))
    .join(' ');
};

// Calculate time ago
export const timeAgo = (date) => {
  if (!date) return '';

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';

  return 'Just now';
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '';

  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Random pastel color generator for avatars
export const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
};
