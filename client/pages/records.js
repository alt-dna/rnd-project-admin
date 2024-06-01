import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatDate } from "@/lib/utils";
import Spinner from "@/components/Spinner";

export default function AccidentsPage() {
  const [accidents, setAccidents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCameraName, setSelectedCameraName] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const fetchAccidents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/accidents');
      setAccidents(res.data);
    } catch (err) {
      setError('Failed to fetch accidents. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccidents();
  }, []);

  const uniqueValues = (key) => {
    return Array.from(new Set(accidents.map(accident => {
      const keys = key.split('.');
      let value = accident;
      for (const k of keys) {
        value = value ? value[k] : undefined;
      }
      return value;
    }))).filter(value => value !== undefined);
  };

  const filterAccidents = () => {
    return accidents.filter(accident =>
      (!selectedStatus || accident.status === selectedStatus) &&
      (!selectedCameraName || (accident.cameraDetails && accident.cameraDetails.cameraName === selectedCameraName)) &&
      (!selectedCity || accident.location.includes(selectedCity)) &&
      (!selectedDistrict || accident.location.includes(selectedDistrict))
    );
  };

  return (
    <Layout>
      <h1>Recorded Accidents</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="flex gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            {uniqueValues('status').map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Camera Name</label>
          <select
            value={selectedCameraName}
            onChange={(e) => setSelectedCameraName(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            {uniqueValues('cameraDetails.cameraName').map(cameraName => (
              <option key={cameraName} value={cameraName}>{cameraName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            {uniqueValues('location.city').map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            {uniqueValues('location.district').map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <table className="basic">
          <thead>
            <tr>
              <th className="text-left">Accident ID</th>
              <th className="text-left">Time Detected</th>
              <th className="text-left">Camera Name</th>
              <th className="text-left">Location</th>
              <th className="text-left">Status</th>
              <th className="text-left">Processed By</th>
              <th className="text-left">Screenshot</th>
            </tr>
          </thead>
          <tbody>
            {filterAccidents().length > 0 ? (
              filterAccidents().map((accident) => (
                <tr key={accident._id}>
                  <td>{accident._id}</td>
                  <td>{formatDate(accident.time_detected)}</td>
                  <td>{accident.cameraDetails?.cameraName || 'N/A'}</td>
                  <td>{accident.location}</td>
                  <td>{accident.status}</td>
                  <td>{accident.processedBy?.name || 'N/A'}</td>
                  <td>
                    <img src={accident.screenshot} alt="Screenshot" className="w-20 h-20 object-cover" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No accidents found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
