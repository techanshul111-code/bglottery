import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import ResultsTable from "@/components/ResultsTable";

export default function Landing() {
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const { data: results, isLoading } = useQuery({
    queryKey: ["/api/results", dateRange.startDate, dateRange.endDate],
  });

  const handleLogin = (type: 'admin' | 'user') => {
    localStorage.setItem('intendedDestination', `/${type}`);
    window.location.href = '/api/login';
  };

  const handleFilterSearch = () => {
    // Trigger search - the query will automatically update
  };

  return (
    <div className="bhagya-background min-h-screen">
      <div className="bhagya-container">
        {/* Header */}
        <div className="bhagya-header text-center">
          Show Answers
        </div>

        {/* Filter Section - Exact match to screenshot */}
        <div className="date-filter-section pt-[5px] pb-[5px] pl-[15px] pr-[15px] ml-[2px] mr-[2px]">
          <div className="date-filter-row">
            <span className="date-label text-[14px]">Start Date :</span>
            <div className="date-input-container">
              <input
                type="date"
                value={dateRange.startDate || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="date-input-field ml-[30px] mr-[30px] pt-[0px] pb-[0px]"
              />
              <span className="date-calendar-icon">📅</span>
            </div>
            
            <span className="date-label text-[14px]">End Date :</span>
            <div className="date-input-container">
              <input
                type="date"
                value={dateRange.endDate || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="date-input-field ml-[30px] mr-[30px] pt-[0px] pb-[0px]"
              />
              <span className="date-calendar-icon">📅</span>
            </div>
            
            <button 
              className="go-button"
              onClick={handleFilterSearch}
            >
              Go
            </button>
          </div>
        </div>

        {/* Date Result Header */}
        <div className="text-center mb-4">
          <span className="text-black font-bold text-[14px]">
            Date: {new Date().toDateString()}
          </span>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded mb-6" style={{width: '1160px'}}>
          {isLoading ? (
            <div className="p-8 text-left">
              <p className="text-gray-600">Loading results...</p>
            </div>
          ) : (
            <ResultsTable results={results as any || []} />
          )}
        </div>

        {/* Navigation Links */}
        <div className="text-left mb-6">
          <a 
            href="#"
            className="simple-link"
            onClick={(e) => { e.preventDefault(); handleLogin('admin'); }}
          >
            Admin Login
          </a>
          <a 
            href="#"
            className="simple-link"
            onClick={(e) => { e.preventDefault(); handleLogin('user'); }}
          >
            User Login
          </a>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer text-[16px]">
          <div className="disclaimer-text text-[17px]">
            This website is intended strictly for entertainment purposes only. Any misuse of the content or involvement in illegal usage is prohibited. We are not responsible for any unlawful use or consequences arising from such misuse.
          </div>
        </div>
      </div>
    </div>
  );
}
