// import Layout from "@/components/Layout";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import dynamic from "next/dynamic";
// import Chart from 'chart.js/auto';
//
// const Map = dynamic(() => import('@/components/Map'), { ssr: false });
//
// export default function DashboardPage() {
//   const [accidents, setAccidents] = useState([]);
//   const [stats, setStats] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//
//   const fetchAccidents = async () => {
//     setIsLoading(true);
//     setError('');
//     try {
//       const res = await axios.get('/api/accidents');
//       setAccidents(res.data);
//     } catch (err) {
//       setError('Failed to fetch accidents. Please try again.');
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const fetchStats = async () => {
//     try {
//       const res = await axios.get('/api/accident-stats'); // Example endpoint for aggregated stats
//       setStats(res.data);
//     } catch (err) {
//       console.error('Failed to fetch stats:', err);
//     }
//   };
//
//   useEffect(() => {
//     fetchAccidents();
//     fetchStats();
//   }, []);
//
//   useEffect(() => {
//     if (accidents.length > 0) {
//       renderTrendChart();
//       renderFalseAlarmChart();
//     }
//   }, [accidents]);
//
//   const renderTrendChart = () => {
//     const ctx = document.getElementById('trendChart').getContext('2d');
//     const labels = accidents.map(acc => new Date(acc.time_detected).toLocaleDateString());
//     const data = accidents.map(acc => acc.status === 'processed' ? 1 : 0);
//
//     new Chart(ctx, {
//       type: 'line',
//       data: {
//         labels,
//         datasets: [{
//           label: 'Accidents Over Time',
//           data,
//           borderColor: 'rgba(75, 192, 192, 1)',
//           backgroundColor: 'rgba(75, 192, 192, 0.2)',
//         }],
//       },
//       options: {
//         scales: {
//           x: { title: { display: true, text: 'Date' } },
//           y: { title: { display: true, text: 'Number of Accidents' } },
//         },
//       },
//     });
//   };
//
//   const renderFalseAlarmChart = () => {
//     const ctx = document.getElementById('falseAlarmChart').getContext('2d');
//     const falseAlarms = accidents.filter(acc => acc.status === 'false_alarm').length;
//     const totalAccidents = accidents.length;
//
//     new Chart(ctx, {
//       type: 'doughnut',
//       data: {
//         labels: ['False Alarms', 'True Accidents'],
//         datasets: [{
//           data: [falseAlarms, totalAccidents - falseAlarms],
//           backgroundColor: ['#FF6384', '#36A2EB'],
//         }],
//       },
//     });
//   };
//
//   return (
//     <Layout>
//       <h1>Dashboard</h1>
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//       {isLoading ? (
//         <p>Loading...</p>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div className="stat-card bg-white p-4 rounded shadow-sm">
//               <h2 className="text-xl font-bold mb-2">Total Accidents</h2>
//               <p className="text-2xl">{stats.totalAccidents || 0}</p>
//             </div>
//             <div className="stat-card bg-white p-4 rounded shadow-sm">
//               <h2 className="text-xl font-bold mb-2">False Alarms</h2>
//               <p className="text-2xl">{stats.falseAlarms || 0}</p>
//             </div>
//             <div className="stat-card bg-white p-4 rounded shadow-sm">
//               <h2 className="text-xl font-bold mb-2">Processed Accidents</h2>
//               <p className="text-2xl">{stats.processedAccidents || 0}</p>
//             </div>
//           </div>
//           <div className="mt-8">
//             <h2 className="text-xl font-bold mb-2">Accident Heatmap</h2>
//             <Map accidents={accidents} />
//           </div>
//           <div className="mt-8">
//             <h2 className="text-xl font-bold mb-2">Accident Trends</h2>
//             <canvas id="trendChart" height="100"></canvas>
//           </div>
//           <div className="mt-8">
//             <h2 className="text-xl font-bold mb-2">False Alarm Analysis</h2>
//             <canvas id="falseAlarmChart" height="100"></canvas>
//           </div>
//         </>
//       )}
//     </Layout>
//   );
// }
