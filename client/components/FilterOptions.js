import DateFilterOptions from "@/components/DateFilterOptions";

export default function FilterOptions({
  selectedFilter,
  setSelectedFilter,
  resetFilters,
  cameras,
  districts,
  wards,
  setWards,
  streets,
  setStreets,
  adminNames,
  selectedStatus,
  setSelectedStatus,
  selectedCameraName,
  setSelectedCameraName,
  selectedDistrict,
  setSelectedDistrict,
  selectedWard,
  setSelectedWard,
  selectedStreet,
  setSelectedStreet,
  selectedAdmin,
  setSelectedAdmin,
  uniqueValues,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth
}) {
  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setSelectedDistrict(selectedDistrict);
    const district = districts.find(d => d.name === selectedDistrict);
    setWards(district ? district.ward : []);
    setStreets([]);
    setSelectedWard('');
    setSelectedStreet('');
  };

  const handleWardChange = (e) => {
    const selectedWard = e.target.value;
    setSelectedWard(selectedWard);
    const district = districts.find(d => d.name === selectedDistrict);
    setStreets(district ? district.street : []);
    setSelectedStreet('');
  };


  return (
    <div className="flex gap-4 mb-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">Filter By</label>
        <select
          value={selectedFilter}
          onChange={(e) => {
            setSelectedFilter(e.target.value);
            resetFilters();
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select Filter</option>
          <option value="cameraName">Camera Name</option>
          <option value="district">District</option>
          <option value="admin">Admins</option>
          <option value="date">Month</option>
        </select>
      </div>

      {selectedFilter === 'cameraName' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Camera Name</label>
          <select
            value={selectedCameraName}
            onChange={(e) => setSelectedCameraName(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            {cameras.map(camera => (
              <option key={camera._id} value={camera.cameraName}>{camera.cameraName}</option>
            ))}
          </select>
        </div>
      )}

      {selectedFilter === 'district' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All</option>
              {districts.map(district => (
                <option key={district.name} value={district.name}>{district.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ward</label>
            <select
              value={selectedWard}
              onChange={handleWardChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              disabled={!selectedDistrict}
            >
              <option value="">All</option>
              {wards.map(ward => (
                <option key={ward.name} value={ward.name}>{ward.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Street</label>
            <select
              value={selectedStreet}
              onChange={(e) => setSelectedStreet(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              disabled={!selectedWard}
            >
              <option value="">All</option>
              {streets.map(street => (
                <option key={street} value={street}>{street}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {selectedFilter === 'admin' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Admin</label>
          <select
            value={selectedAdmin}
            onChange={(e) => setSelectedAdmin(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            {adminNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedFilter === 'date' && (
        <DateFilterOptions
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />
      )}

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
    </div>
  );
}
