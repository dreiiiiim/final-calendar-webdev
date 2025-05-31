import React from 'react';

const NavigationControls = ({
  currentMonth,
  currentYear,
  currentWeek,
  currentDay,
  viewMode,
  onPrev,
  onNext,
  onViewModeChange
}) => {
  const monthsOfYear = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getWeekRange = () => {
    const date = new Date(currentYear, currentMonth, currentDay);
    const dayOfWeek = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - dayOfWeek);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return {
      start: startDate.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      end: endDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  const getDayString = () => {
    const date = new Date(currentYear, currentMonth, currentDay);
    return date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* View Mode Toggle */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => onViewModeChange("month")}
          className={`text-3xl px-4 py-2 rounded-xl ${
            viewMode === "month" ? "bg-redcolor text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Month
        </button>
        <button
          onClick={() => onViewModeChange("week")}
          className={`text-3xl px-4 py-2 rounded-xl ${
            viewMode === "week" ? "bg-redcolor text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => onViewModeChange("day")}
          className={`text-3xl px-4 py-2 rounded-xl ${
            viewMode === "day" ? "bg-redcolor text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Day
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          aria-label={`Previous ${viewMode}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          {viewMode === "month" && (
            <>
              <h2 className="text-4xl font-bold text-gray-800">
                {monthsOfYear[currentMonth]}
              </h2>
              <h3 className="text-2xl text-gray-600">
                {currentYear}
              </h3>
            </>
          )}
          
          {viewMode === "day" && (
            <>
              <h2 className="text-4xl font-bold text-gray-800">
                {getDayString()}
              </h2>
              <h3 className="text-2xl text-gray-600">
                {new Date(currentYear, currentMonth, currentDay).toLocaleDateString('default', { weekday: 'long' })}
              </h3>
            </>
          )}
        </div>

        <button
          onClick={onNext}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          aria-label={`Next ${viewMode}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;