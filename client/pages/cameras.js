import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import AllCamFeeds from "@/components/AllCamFeeds";
import SimpleFilterOptions from "@/components/SimpleFilterOptions";
import CameraList from "@/components/CameraList";

export default function Cameras() {
  const [cameras, setCameras] = useState([]);
  const [filteredCameras, setFilteredCameras] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');
  const [selectedCameraName, setSelectedCameraName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [wards, setWards] = useState([]);
  const [streets, setStreets] = useState([]);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await axios.get('/api/cameras');
        setCameras(response.data);
        setFilteredCameras(response.data);
      } catch (error) {
        console.error("Error fetching cameras:", error);
      }
    };

    fetchCameras().catch(error => console.error("Error on initial fetch:", error));

    const intervalId = setInterval(fetchCameras, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let filtered = cameras;
    if (selectedDistrict) {
      filtered = filtered.filter(camera => camera.cameraDistrict === selectedDistrict);
    }
    if (selectedWard) {
      filtered = filtered.filter(camera => camera.cameraWard === selectedWard);
    }
    if (selectedStreet) {
      filtered = filtered.filter(camera => camera.cameraStreet === selectedStreet);
    }
    if (selectedCameraName) {
      filtered = filtered.filter(camera => camera.cameraName.toLowerCase().includes(selectedCameraName.toLowerCase()));
    }
    if (selectedStatus) {
      filtered = filtered.filter(camera => camera.status === selectedStatus);
    }
    setFilteredCameras(filtered);
  }, [selectedDistrict, selectedWard, selectedStreet, selectedCameraName, selectedStatus, cameras]);

  const uniqueValues = (key) => {
    return Array.from(new Set(cameras.map(camera => {
      const keys = key.split('.');
      let value = camera;
      for (const k of keys) {
        value = value ? value[k] : undefined;
      }
      return value;
    }))).filter(value => value !== undefined);
  };

  const handleFilterChange = ({ selectedDistrict, selectedWard, selectedStreet, selectedCameraName }) => {
    setSelectedDistrict(selectedDistrict);
    setSelectedWard(selectedWard);
    setSelectedStreet(selectedStreet);
    setSelectedCameraName(selectedCameraName);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-5">
        <Link className="inline-block px-5 py-2 outline outline-blue-900 text-blue-900
                            rounded text-center transition-all
                            hover:bg-blue-900 hover:text-white"
              href={'/cameras/new'}
        >
          Add new camera
        </Link>
        <div>
          <button
            className={`tab ${activeTab === "list" ? "active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              Camera List
            </div>
          </button>
          <button
            className={`tab ${activeTab === "feeds" ? "active" : ""}`}
            onClick={() => setActiveTab("feeds")}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
              All Live Feeds
            </div>
          </button>
        </div>
      </div>

      <SimpleFilterOptions
        cameras={cameras}
        onFilterChange={handleFilterChange}
      />

      {activeTab === "list" && (
        <CameraList cameras={filteredCameras} />
      )}

      {activeTab === "feeds" && (
        <AllCamFeeds cameras={filteredCameras} />
      )}
    </Layout>
  );
}
