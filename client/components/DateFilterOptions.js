import { useEffect } from 'react';

export default function DateFilterOptions({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth
}) {
  const year = new Date().getFullYear();
  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  useEffect(() => {
    setSelectedYear(year);
  }, [setSelectedYear, year]);

  return (
    <div className="flex gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          disabled
        >
          <option value={year}>{year}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          disabled={!selectedYear}
        >
          <option value="">Select Month</option>
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
