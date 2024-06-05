import { useState, useEffect } from "react";

export default function SimpleFilterOptions({
  cameras,
  onFilterChange
}) {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');
  const [wards, setWards] = useState([]);
  const [streets, setStreets] = useState([]);

  const districts = Array.from(new Set(cameras.map(camera => camera.cameraDistrict)));

  useEffect(() => {
    if (selectedDistrict === '') {
      setSelectedWard('');
      setSelectedStreet('');
      setWards([]);
      setStreets([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedWard === '') {
      setSelectedStreet('');
      setStreets([]);
    }
  }, [selectedWard]);

  useEffect(() => {
    onFilterChange({
      selectedDistrict,
      selectedWard,
      selectedStreet,
    });
  }, [selectedDistrict, selectedWard, selectedStreet]);

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setSelectedDistrict(selectedDistrict);
    const districtWards = cameras.filter(camera => camera.cameraDistrict === selectedDistrict).map(camera => camera.cameraWard);
    setWards([...new Set(districtWards)]);
    setSelectedWard('');
    setStreets([]);
  };

  const handleWardChange = (e) => {
    const selectedWard = e.target.value;
    setSelectedWard(selectedWard);
    const wardStreets = cameras.filter(camera => camera.cameraDistrict === selectedDistrict && camera.cameraWard === selectedWard).map(camera => camera.cameraStreet);
    setStreets([...new Set(wardStreets)]);
    setSelectedStreet('');
  };

  return (
    <div className="flex gap-4 mb-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">District</label>
        <select
          value={selectedDistrict}
          onChange={handleDistrictChange}
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
          <label className="block text-sm font-medium text-gray-700">Ward</label>
          <select
            value={selectedWard}
            onChange={handleWardChange}
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
          <label className="block text-sm font-medium text-gray-700">Street</label>
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
  );
}
