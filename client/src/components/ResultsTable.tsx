import type { Result } from "@shared/schema";

interface ResultsTableProps {
  results: Result[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const generateTimeSlots = () => {
    const times = [
      "09:00 A.M",
      "09:15 A.M",
      "09:30 A.M",
      "09:45 A.M",
      "10:00 A.M",
      "10:15 A.M",
      "10:30 A.M",
      "10:45 A.M",
      "11:00 A.M",
      "11:20 A.M",
      "11:40 A.M",
      "12:00 P.M",
      "12:20 P.M",
      "12:40 P.M",
      "01:00 P.M",
      "01:20 P.M",
      "01:40 P.M",
      "02:00 P.M",
      "02:20 P.M",
      "02:40 P.M",
      "03:00 P.M",
      "03:20 P.M",
      "03:40 P.M",
      "04:00 P.M",
      "04:20 P.M",
      "04:40 P.M",
      "05:00 P.M",
      "05:20 P.M",
      "05:40 P.M",
      "06:00 P.M",
      "06:20 P.M",
      "06:40 P.M",
      "07:00 P.M",
      "07:20 P.M",
      "07:40 P.M",
      "08:00 P.M",
      "08:20 P.M",
      "08:40 P.M",
      "09:00 P.M",
      "09:20 P.M",
      "09:40 P.M",
    ];

    return times;
  };

  const getResultForTime = (time: string, date: string) => {
    return results.find((r) => r.time === time && r.date === date);
  };

  const timeSlots = generateTimeSlots();
  const currentDate = new Date().toISOString().split("T")[0];

  return (
    <div style={{width: '1160px', overflow: 'visible'}}>
      <table className="bhagya-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>XA</th>
            <th>XB</th>
            <th>XC</th>
            <th>XD</th>
            <th>XE</th>
            <th>XF</th>
            <th>XG</th>
            <th>XH</th>
            <th>XI</th>
            <th>XJ</th>
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time) => {
            const result = getResultForTime(time, currentDate);
            return (
              <tr key={time}>
                <td className="text-[#ffffff] bg-[#000000]">{currentDate}</td>
                <td>{time}</td>
                <td>{result?.xa || ""}</td>
                <td>{result?.xb || ""}</td>
                <td>{result?.xc || ""}</td>
                <td>{result?.xd || ""}</td>
                <td>{result?.xe || ""}</td>
                <td>{result?.xf || ""}</td>
                <td>{result?.xg || ""}</td>
                <td>{result?.xh || ""}</td>
                <td>{result?.xi || ""}</td>
                <td>{result?.xj || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
