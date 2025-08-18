import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Search } from "lucide-react";

interface DateFilterProps {
  onFilterChange: (startDate?: string, endDate?: string) => void;
}

export default function DateFilter({ onFilterChange }: DateFilterProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilter = () => {
    onFilterChange(startDate || undefined, endDate || undefined);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    onFilterChange();
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
      <div className="flex items-center space-x-2">
        <Label className="text-gray-700 font-medium">Start Date:</Label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border-2 border-gray-300 focus:border-yellow-500"
        />
        <Calendar className="text-yellow-500" size={20} />
      </div>
      
      <div className="flex items-center space-x-2">
        <Label className="text-gray-700 font-medium">End Date:</Label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border-2 border-gray-300 focus:border-yellow-500"
        />
        <Calendar className="text-yellow-500" size={20} />
      </div>
      
      <Button 
        onClick={handleFilter}
        className="lottery-button flex items-center gap-2"
      >
        <Search size={16} />
        Go
      </Button>
      
      {(startDate || endDate) && (
        <Button 
          onClick={handleReset}
          variant="outline"
          className="border-gray-300 hover:border-yellow-500"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
