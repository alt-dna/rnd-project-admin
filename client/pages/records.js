import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { formatDate } from "@/lib/utils";
import FilterOptions from "@/components/FilterOptions";
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import ImageEnlarger from "@/components/ImageEnlarger";
import Papa from 'papaparse';

export default function AccidentsPage() {
  const { data: session } = useSession();
  const [accidents, setAccidents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCameraName, setSelectedCameraName] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [streets, setStreets] = useState([]);
  const [adminNames, setAdminNames] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');

  const fetchAccidents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/accidents');
      setAccidents(res.data);
      const adminSet = new Set(res.data.map(accident => accident.processedBy?.name).filter(Boolean));
      setAdminNames(Array.from(adminSet));
    } catch (err) {
      setError('Failed to fetch accidents. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCameras = async () => {
    try {
      const res = await axios.get('/api/cameras');
      setCameras(res.data);
    } catch (err) {
      console.error("Failed to fetch cameras:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get('/api/locations');
      setDistricts(res.data.district || []);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    }
  };

  useEffect(() => {
    fetchAccidents();
    fetchCameras();
    fetchLocations();
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

  const stripStreetNumbers = (street) => {
    return street.replace(/^\d+\s*/, '');
  };

  const filterAccidents = () => {
    return accidents.filter(accident => {
      const camera = accident.cameraId;
      const accidentDate = new Date(accident.time_detected);
      const accidentYear = accidentDate.getFullYear();
      const accidentMonth = accidentDate.getMonth() + 1;
      return (
        (!selectedStatus || accident.status === selectedStatus) &&
        (!selectedCameraName || camera?.cameraName === selectedCameraName) &&
        (!selectedDistrict || camera?.cameraDistrict === selectedDistrict) &&
        (!selectedWard || camera?.cameraWard === selectedWard) &&
        (!selectedStreet || stripStreetNumbers(camera?.cameraStreet) === stripStreetNumbers(selectedStreet)) &&
        (!selectedAdmin || accident.processedBy?.name === selectedAdmin) &&
        (!selectedYear || accidentYear === parseInt(selectedYear)) &&
        (!selectedMonth || accidentMonth === parseInt(selectedMonth))
      );
    });
  };

  const resetFilters = () => {
    setSelectedStatus('');
    setSelectedCameraName('');
    setSelectedDistrict('');
    setSelectedWard('');
    setSelectedStreet('');
    setSelectedAdmin('');
    setWards([]);
    setStreets([]);
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth('');
  };

  const handleImageClick = (imageSrc) => {
    setModalImage(imageSrc);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalImage('');
  };

  const exportToCSV = () => {
    const dataToExport = filterAccidents().map(accident => ({
      accidentId: accident._id,
      timeDetected: formatDate(accident.time_detected),
      cameraName: accident.cameraId?.cameraName || 'N/A',
      location: accident.cameraId?.cameraFullAddress || 'N/A',
      processedBy: accident.processedBy?.name || 'N/A',
      status: accident.status
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
    <Layout>
      <h1>Recorded Accidents</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="flex justify-between items-center mb-4 mt-8 gap-4">
        <div className="flex-grow">
          <FilterOptions
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            resetFilters={resetFilters}
            cameras={cameras}
            districts={districts}
            wards={wards}
            setWards={setWards}
            streets={streets}
            setStreets={setStreets}
            adminNames={adminNames}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedCameraName={selectedCameraName}
            setSelectedCameraName={setSelectedCameraName}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            selectedWard={selectedWard}
            setSelectedWard={setSelectedWard}
            selectedStreet={selectedStreet}
            setSelectedStreet={setSelectedStreet}
            selectedAdmin={selectedAdmin}
            setSelectedAdmin={setSelectedAdmin}
            uniqueValues={uniqueValues}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        </div>
        <button
          onClick={exportToCSV}
          className="bg-blue-900 text-white py-2 px-4 rounded-md inline-flex"
        >
          Export to CSV
        </button>
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
              <th className="text-left">Screenshot</th>
              <th className="text-left">Processed By</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filterAccidents().length > 0 ? (
              filterAccidents().map((accident) => (
                <tr key={accident._id}>
                  <td className="text-sm">{accident._id}</td>
                  <td>{formatDate(accident.time_detected)}</td>
                  <td>{accident.cameraId?.cameraName || 'N/A'}</td>
                  <td>{accident.cameraId?.cameraFullAddress}</td>
                  <td>
                    <img
                      src={accident.screenshot}
                      alt="Screenshot"
                      className="w-20 h-20 object-cover cursor-pointer"
                      onClick={() => handleImageClick(accident.screenshot)}
                    />
                  </td>
                  <td>{accident.processedBy?.name || 'N/A'}</td>
                  <td>{accident.status}</td>
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
      <ImageEnlarger show={showModal} onClose={handleCloseModal}>
        <img src={modalImage} alt="Expanded screenshot" className="w-full h-auto" />
      </ImageEnlarger>
    </Layout>
  );
}
