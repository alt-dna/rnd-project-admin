import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import axios from "axios";
import {useRouter} from "next/router";

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function CameraForm({
  cameraName: existingCameraName,
  cameraDistrict: existingCameraDistrict,
  cameraWard: existingCameraWard,
  cameraStreet: existingCameraStreet,
  cameraFullAddress: existingCameraFullAddress,
  cameraUrl: existingCameraUrl,
  description: existingDescription,
  status: existingStatus,
  manageGroup: existingManageGroup,
  _id,
}) {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(existingCameraDistrict || '');
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(existingCameraWard || '');
  const [streets, setStreets] = useState([]);
  const [selectedStreet, setSelectedStreet] = useState(existingCameraStreet || '');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState(existingCameraFullAddress || '');
  const [status, setStatus] = useState(existingStatus || 'working');
  const [cameraName, setCameraName] = useState(existingCameraName || '');
  const [cameraUrl, setCameraUrl] = useState(existingCameraUrl || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(existingManageGroup || '');
  const router = useRouter()

  useEffect(() => {
    fetch('/api/locations')
      .then(response => response.json())
      .then(data => {
        setDistricts(data.district || []);
        if (existingCameraDistrict) {
          const district = data.district.find(d => d.name === existingCameraDistrict);
          if (district) {
            setWards(district.ward || []);
            setStreets(district.street || []);
          }
        }
      });
  }, [existingCameraDistrict]);



  useEffect(() => {
    if (selectedDistrict) {
      fetch(`/api/groups?district=${encodeURIComponent(selectedDistrict)}`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log("Groups fetched:", data); // Debugging log
          setGroups(data || []);
        })
        .catch(error => console.error("Error fetching groups:", error));
    }
  }, [selectedDistrict]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    const district = districts.find(d => d.name === districtName);
    if (district) {
      setWards(district.ward || []);
      setStreets([]);
      setSelectedDistrict(districtName);
      setSelectedWard('');
      setSelectedStreet('');
      setAddress(districtName);
    }
  };

  const handleWardChange = (e) => {
    const wardName = e.target.value;
    const ward = wards.find(w => w.name === wardName);
    if (ward) {
      const district = districts.find(d => d.name === selectedDistrict);
      if (district) {
        setStreets(district.street || []);
        setSelectedWard(wardName);
        setSelectedStreet('');
        setAddress(`Phường ${wardName}, ${selectedDistrict}`);
      }
    }
  };

  const handleStreetChange = (e) => {
    const streetName = e.target.value;
    setSelectedStreet(streetName);
    setAddress(`Đ. ${streetName}, Phường ${selectedWard}, ${selectedDistrict}`);
  };

  const handleAddressChange = (e) => {
    const newAddress = e.target.value
    setAddress(newAddress);
    parseAndSetAddress(newAddress)
  };

  const parseAndSetAddress = (address) => {
    const parts = address.split(',').map(part => part.trim());
    if (parts.length === 3) {
      const [streetPart, ward, district] = parts;
      const street = streetPart.replace(/^\d+\s*/, '');
      const districtObj = districts.find(d => d.name === district);
      if (districtObj) {
        setSelectedDistrict(districtObj.name);
        setWards(districtObj.ward || []);
        setStreets(districtObj.street || []);
        const wardObj = districtObj.ward.find(w => `Phường ${w.name}` === ward);
        if (wardObj) {
          setSelectedWard(wardObj.name);

          const streetObj = districtObj.street.find(s => `Đ. ${s}` === street);
          if (streetObj) {
            setSelectedStreet(streetObj)
          }
        }
      }
    }
  }

  async function createCamera(ev) {
    ev.preventDefault()
    const cameraData = {
    cameraName,
    cameraCity: "HCM",
    cameraDistrict: selectedDistrict,
    cameraWard: selectedWard,
    cameraStreet: selectedStreet,
    cameraFullAddress: address,
    cameraUrl,
    description,
    coordinates: selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null,
    status,
    manageGroup: selectedGroup,
    };

    try {
      let res;
      if (_id) {
        res = await axios.put('/api/cameras', {...cameraData, _id});
      } else {
        res = await axios.post('/api/cameras', cameraData);
      }
      if (res.status === 201 || res.status === 200) {
        await router.push('/cameras');
      } else {
        console.error("Failed to save camera:", res.statusText);
      }
    } catch (error) {
      console.error("Error saving camera:", error);
    }
  }
  return (
      <form onSubmit={createCamera} className="max-w-5xl mx-auto grid grid-cols-2 gap-16">
        <div className="grow pt-2 col-span-2 sm:col-span-1">
          <label htmlFor="nameIn">Camera Name</label>
          <input
            id="nameIn"
            type="text"
            placeholder="Camera Name"
            className="w-full p-2 border rounded mb-4"
            value={cameraName}
            onChange={(e) => setCameraName(e.target.value)}
            required
          />

          <label htmlFor="urlIn">Camera URL</label>
          <input
            id="urlIn"
            type="text"
            placeholder="camera link, .m3u8"
            className="w-full p-2 border rounded mb-4"
            value={cameraUrl}
            onChange={(e) => setCameraUrl(e.target.value)}
            required
          />

          <label>Status</label>
          <div className="flex mb-4 pb-4">
            <label className="mr-4 font-normal">
              <input
                type="radio"
                name="status"
                value="working"
                checked={status === "working"}
                onChange={(e) => setStatus(e.target.value)}
                required
              />
              Working
            </label>
            <label className="font-normal">
              <input
                type="radio"
                name="status"
                value="maintenance"
                checked={status === "maintenance"}
                onChange={(e) => setStatus(e.target.value)}
                required
              />
              maintenance
            </label>
          </div>


          <label htmlFor="descIn">Details</label>
          <textarea
            id="descIn"
            cols="30"
            rows="10"
            placeholder="`Vòng xoay ngã 6`, `Trước cổng bệnh viện 115`"
            className="w-full p-2 border rounded mb-4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="grow pt-2 py-2 col-span-2 sm:col-span-1">
          <label htmlFor="location">Location</label>
          <select value={selectedDistrict} onChange={handleDistrictChange}>
            <option value="">Select District</option>
            {districts.map((d, index) => (
              <option key={`${d.name}-${index}`} value={d.name}>{d.name}</option>
            ))}
          </select>
          <select value={selectedWard} onChange={handleWardChange} disabled={!selectedDistrict}>
            <option value="">Select Ward</option>
            {wards.map((w, index) => (
              <option key={`${w.name}-${index}`} value={w.name}>{w.name}</option>
            ))}
          </select>
          <select value={selectedStreet} onChange={handleStreetChange} disabled={!selectedWard}>
            <option value="">Select Street</option>
            {streets.map((s, index) => (
              <option key={`${s}-${index}`} value={s}>{s}</option>
            ))}
          </select>

          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter address"
            className="w-full p-2 border rounded mb-4"
          />

          <label htmlFor="group">Manage Group</label>
          <select value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                  required
          >
            <option value="">Select Group</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>{group.groupName}</option>
            ))}
          </select>

          <div className="bg-gray-200 p-4 px-2 min-h-12 rounded text-gray-400 text-center">
            <Map address={address} onLocationSelect={handleLocationSelect} />
          </div>
          <div className="col-span-2 flex justify-center">
            <button type="submit"
                    className="w-full my-10 p-2 border rounded bg-blue-600 text-white"
            >
              Save
            </button>
          </div>
        </div>
      </form>
  );
}
