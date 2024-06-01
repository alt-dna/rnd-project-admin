import { useEffect, useState } from 'react';
import axios from 'axios';
import CameraFeed from '@/components/CameraFeed';
import AccidentLog from '@/components/AccidentLog';

export default function AllCamFeeds() {
  const [cameras, setCameras] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await axios.get('/api/cameras');
        setCameras(response.data);
      } catch (error) {
        console.error('Error fetching cameras:', error);
      }
    };
    fetchCameras();
  }, []);

  const districts = Array.from(new Set(cameras.map(camera => camera.cameraDistrict)));
  const wards = Array.from(new Set(cameras
    .filter(camera => camera.cameraDistrict === selectedDistrict)
    .map(camera => camera.cameraWard)
  ));
  const streets = Array.from(new Set(cameras
    .filter(camera => camera.cameraWard === selectedWard)
    .map(camera => camera.cameraStreet)
  ));

  const filteredCameras = cameras.filter(camera =>
    (!selectedDistrict || camera.cameraDistrict === selectedDistrict) &&
    (!selectedWard || camera.cameraWard === selectedWard) &&
    (!selectedStreet || camera.cameraStreet === selectedStreet)
  );

  useEffect(() => {
    if (selectedDistrict === '') {
      setSelectedWard('');
      setSelectedStreet('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedWard === '') {
      setSelectedStreet('');
    }
  }, [selectedWard]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-5">All Live Camera Feeds</h2>

      <div className="flex gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedWard('');
            }}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {selectedDistrict && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Ward</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Wards</option>
              {wards.map(ward => (
                <option key={ward} value={ward}>{ward}</option>
              ))}
            </select>
          </div>
        )}

        {selectedWard && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Street</label>
            <select
              value={selectedStreet}
              onChange={(e) => setSelectedStreet(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Streets</option>
              {streets.map(street => (
                <option key={street} value={street}>{street}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="camera-container md:col-span-2">
          {filteredCameras.map((camera) => (
            <CameraFeed key={camera._id} camera={camera} />
          ))}
        </div>
        <AccidentLog />
      </div>
    </>
  );
}
