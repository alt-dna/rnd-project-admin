import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ComposedChartComponent,
  PieChartComponent,
  AreaChartComponent,
  MixBarChartComponent
} from './Charts';
import Papa from 'papaparse';

export default function DashboardSummary() {
  const [summary, setSummary] = useState({
    totalCameras: 0,
    workingCameras: 0,
    maintenanceCameras: 0,
    totalAccidents: 0,
    falseAlarmAccidents: 0,
    actualAccidents: 0
  });
  const [accidentData, setAccidentData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [months, setMonths] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const fetchSummary = async () => {
    try {
      const [camerasResponse, accidentsResponse] = await Promise.all([
        axios.get('/api/cameras'),
        axios.get('/api/accidents')
      ]);

      const cameras = camerasResponse.data;
      const accidents = accidentsResponse.data;

      const totalCameras = cameras.length;
      const workingCameras = cameras.filter(camera => camera.status === 'working').length;
      const maintenanceCameras = cameras.filter(camera => camera.status === 'maintenance').length;
      const totalAccidents = accidents.length;
      const falseAlarmAccidents = accidents.filter(accident => accident.isFalseAlarm).length;
      const actualAccidents = accidents.filter(accident => !accident.isFalseAlarm).length;

      setSummary({
        totalCameras,
        workingCameras,
        maintenanceCameras,
        totalAccidents,
        falseAlarmAccidents,
        actualAccidents
      });

      const uniqueMonths = [...new Set(accidents.map(accident => {
        const date = new Date(accident.time_detected);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }))];
      const uniqueDistricts = [...new Set(cameras.map(camera => camera.cameraDistrict))];

      setMonths(['All', ...uniqueMonths]);
      setDistricts(['All', ...uniqueDistricts]);

      // Filter data based on selected month and district
      const filteredAccidents = accidents.filter(accident => {
        const date = new Date(accident.time_detected);
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const matchesMonth = selectedMonth === 'All' || month === selectedMonth;
        const matchesDistrict = selectedDistrict === 'All' || accident.location.includes(selectedDistrict);
        return matchesMonth && matchesDistrict;
      });

      const monthMap = {};
      filteredAccidents.forEach(accident => {
        const date = new Date(accident.time_detected);
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthMap[month]) {
          monthMap[month] = { month, totalAccidents: 0, falseAlarmAccidents: 0, actualAccidents: 0 };
        }
        monthMap[month].totalAccidents += 1;
        if (accident.isFalseAlarm) {
          monthMap[month].falseAlarmAccidents += 1;
        } else {
          monthMap[month].actualAccidents += 1;
        }
      });

      const chartData = Object.values(monthMap).map(data => ({
        date: data.month,
        totalAccidents: data.totalAccidents,
        falseAlarmAccidents: data.falseAlarmAccidents,
        actualAccidents: data.actualAccidents
      }));

      const locationData = filteredAccidents.reduce((acc, accident) => {
        const location = accident.location;
        if (!acc[location]) {
          acc[location] = 0;
        }
        acc[location]++;
        return acc;
      }, {});

      const accidentData = Object.keys(locationData).map(location => ({
        location,
        count: locationData[location],
      }));

      setAccidentData(accidentData);

      const pieData = [
        { name: 'Total Accidents', value: totalAccidents },
        { name: 'False Alarms', value: falseAlarmAccidents },
        { name: 'Actual Accidents', value: actualAccidents },
      ];

      setChartData(chartData);
      setPieData(pieData);

    } catch (error) {
      console.error("Error fetching summary data:", error);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth, selectedDistrict]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  const exportToCSV = () => {
    const dataToExport = accidentData.map(accident => ({
      location: accident.location,
      count: accident.count
    }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'accidents_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="summary">
      <h2 className="text-xl font-bold mb-4">Dashboard Summary</h2>

      {/* Summary Tiles */}
      <div className="tiles-grid">
        <div className="tile">
          <h3 className="tile-header">Total Cameras</h3>
          <p className="tile-number">{summary.totalCameras}</p>
        </div>
        <div className="tile">
          <h3 className="tile-header">Working Cameras</h3>
          <p className="tile-number">{summary.workingCameras}</p>
        </div>
        <div className="tile">
          <h3 className="tile-header">Maintenance Cameras</h3>
          <p className="tile-number">{summary.maintenanceCameras}</p>
        </div>
        <div className="tile">
          <h3 className="tile-header">Total Accidents</h3>
          <p className="tile-number">{summary.totalAccidents}</p>
        </div>
        <div className="tile">
          <h3 className="tile-header">False Alarms</h3>
          <p className="tile-number">{summary.falseAlarmAccidents}</p>
        </div>
        <div className="tile">
          <h3 className="tile-header">Actual Accidents</h3>
          <p className="tile-number">{summary.actualAccidents}</p>
        </div>
      </div>



      {/* Charts Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">Charts</h2>

      {/* Filters */}
      <div className="mt-8 mb-4 flex gap-4">
        <div>
          <label htmlFor="monthFilter" className="block text-sm font-medium text-gray-700">Filter by Month</label>
          <select
            id="monthFilter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="districtFilter" className="block text-sm font-medium text-gray-700">Filter by Location</label>
          <select
            id="districtFilter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedDistrict}
            onChange={handleDistrictChange}
          >
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-primary bg-blue-700 text-white px-1 rounded-md"
        >
          Export to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-2">Accidents by Month</h3>
          <MixBarChartComponent data={chartData} />
        </div>
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-2">Combined Accident Data</h3>
          <ComposedChartComponent data={chartData} />
        </div>
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-2">Accident Distribution</h3>
          <PieChartComponent data={pieData} />
        </div>
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-2">Accidents by Location</h3>
          <AreaChartComponent data={accidentData} />
        </div>
      </div>
    </div>
  );
}
