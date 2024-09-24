export const getStartOfCurrentWeekday = (): Date => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("he-IL", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
};
