
export const getNextStatementDate = (currentDate: Date, statementDay: number): Date => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Try current month's statement day
  const thisMonthStatement = new Date(year, month, statementDay);
  
  if (currentDate.getTime() < thisMonthStatement.getTime()) {
    return thisMonthStatement;
  } else {
    // If today is on or after statement day, next statement is next month
    return new Date(year, month + 1, statementDay);
  }
};

export const formatTurkishDate = (date: Date): string => {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat('tr-TR', {
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const getMonthYearKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
