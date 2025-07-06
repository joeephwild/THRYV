// Date utility functions for the application

/**
 * Format a date to ISO string without milliseconds
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('.')[0] + 'Z';
};

/**
 * Get the start of a day (midnight)
 * @param date - Date to get start of day from
 * @returns Date object representing start of day
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Get the end of a day (23:59:59.999)
 * @param date - Date to get end of day from
 * @returns Date object representing end of day
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

/**
 * Get the start of a month
 * @param date - Date to get start of month from
 * @returns Date object representing start of month
 */
export const getStartOfMonth = (date: Date = new Date()): Date => {
  const startOfMonth = new Date(date);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
};

/**
 * Get the end of a month
 * @param date - Date to get end of month from
 * @returns Date object representing end of month
 */
export const getEndOfMonth = (date: Date = new Date()): Date => {
  const endOfMonth = new Date(date);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  return endOfMonth;
};

/**
 * Get the start of a week (Sunday)
 * @param date - Date to get start of week from
 * @returns Date object representing start of week
 */
export const getStartOfWeek = (date: Date = new Date()): Date => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
  startOfWeek.setDate(startOfWeek.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

/**
 * Get the end of a week (Saturday)
 * @param date - Date to get end of week from
 * @returns Date object representing end of week
 */
export const getEndOfWeek = (date: Date = new Date()): Date => {
  const endOfWeek = new Date(date);
  const day = endOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
  endOfWeek.setDate(endOfWeek.getDate() + (6 - day));
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

/**
 * Get the start of a year
 * @param date - Date to get start of year from
 * @returns Date object representing start of year
 */
export const getStartOfYear = (date: Date = new Date()): Date => {
  const startOfYear = new Date(date);
  startOfYear.setMonth(0, 1);
  startOfYear.setHours(0, 0, 0, 0);
  return startOfYear;
};

/**
 * Get the end of a year
 * @param date - Date to get end of year from
 * @returns Date object representing end of year
 */
export const getEndOfYear = (date: Date = new Date()): Date => {
  const endOfYear = new Date(date);
  endOfYear.setMonth(11, 31);
  endOfYear.setHours(23, 59, 59, 999);
  return endOfYear;
};

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date with days added
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add months to a date
 * @param date - Base date
 * @param months - Number of months to add
 * @returns New date with months added
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export const isPast = (date: Date): boolean => {
  return date.getTime() < Date.now();
};

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns True if date is in the future
 */
export const isFuture = (date: Date): boolean => {
  return date.getTime() > Date.now();
};

/**
 * Calculate the difference in days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
};

/**
 * Format a date range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
};

/**
 * Get date periods for financial analysis
 * @returns Object with various date periods
 */
export const getDatePeriods = () => {
  const now = new Date();
  
  return {
    today: {
      start: getStartOfDay(now),
      end: getEndOfDay(now),
    },
    thisWeek: {
      start: getStartOfWeek(now),
      end: getEndOfWeek(now),
    },
    thisMonth: {
      start: getStartOfMonth(now),
      end: getEndOfMonth(now),
    },
    thisYear: {
      start: getStartOfYear(now),
      end: getEndOfYear(now),
    },
    last7Days: {
      start: addDays(now, -7),
      end: now,
    },
    last30Days: {
      start: addDays(now, -30),
      end: now,
    },
    last90Days: {
      start: addDays(now, -90),
      end: now,
    },
    lastYear: {
      start: addDays(now, -365),
      end: now,
    },
  };
};