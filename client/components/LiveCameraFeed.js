import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function LiveCameraFeed() {
  const router = useRouter();
  const { id } = router.query;
  const [camera, setCamera] = useState(null);
  const [videoSrc, setVideoSrc] = useState('');
  const [detectionData, setDetectionData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [accidents, setAccidents] = useState([]);

  useEffect(() => {
    const fetchCamera = async () => {
      try {
        const response = await axios.get(`/api/cameras?id=${id}`);
        setCamera(response.data);
        if (response.data.cameraUrl) {
          setVideoSrc(`http://localhost:5000/processed_video_feed?camera_id=${id}`);
        }
      } catch (error) {
        console.error("Error fetching camera data:", error);
      }
    };

    if (id) {
      fetchCamera();
    }
  }, [id]);

  useEffect(() => {
    const fetchDetectionData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/detection_results?camera_id=${id}`);
        setDetectionData(response.data);
      } catch (error) {
        console.error("Error fetching detection data:", error);
      }
    };

    if (id) {
      fetchDetectionData();
    }
  }, [id]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchAccidents = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/accidents?camera_id=${id}`);
        setAccidents(response.data);
      } catch (error) {
        console.error("Error fetching accidents:", error);
      }
    };

    if (id) {
      fetchAccidents();
    }
  }, [id]);

  const goBack = () => {
    router.push('/cameras');
  };

  return (
    <>
      {camera && (
        <>
          <button
            onClick={goBack}
            className="inline-block px-5 py-2 mb-5 bg-gray-200 text-gray-800 rounded text-center transition-all hover:bg-gray-400"
          >
            Back
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="video-container md:col-span-2">
              <h1 className="text-2xl font-bold mb-4">Live Feed for {camera.cameraName}</h1>
              <img src={videoSrc} alt={`Live feed for ${camera.cameraName}`} className="w-full h-96 object-cover rounded" />
            </div>
            <div className="info-container">
              <h2 className="text-xl font-bold mb-2">Current Time: {currentTime}</h2>
              <h3 className="text-lg font-bold mb-4">Camera Information</h3>
              <p><strong>Full Address:</strong> {camera.cameraFullAddress}</p>
              <p><strong>Group in Charge:</strong> {camera.manageGroup?.groupName}</p>
              <p><strong>Phone Number:</strong> {camera.manageGroup?.phoneNumber}</p>
              <p><strong>Description:</strong> {camera.description}</p>
              <p><strong>Status:</strong> {camera.status}</p>
              {detectionData && (
                <div className="detection-data mt-4">
                  <h3 className="text-lg font-bold mb-2">Detection Data</h3>
                  <p>Consecutive Accidents: {detectionData.consecutive_accidents}</p>
                  <p>Alert Trigger: {detectionData.alert_trigger ? 'Yes' : 'No'}</p>
                  <p>Last Detected: {detectionData.last_detected}</p>
                  {detectionData.screenshot && (
                    <div className="mt-2">
                      <h4 className="text-md font-bold">Screenshot</h4>
                      <img src={detectionData.screenshot} alt="Detection Screenshot" className="w-full h-40 object-cover mt-2 rounded" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-8 mb-4">Accidents Detected by This Camera</h2>
          {accidents.length > 0 ? (
            <table className="basic w-full">
              <thead>
                <tr>
                  <th>Time Detected</th>
                  <th>Processed By</th>
                  <th>Status</th>
                  <th>Screenshot</th>
                </tr>
              </thead>
              <tbody>
                {accidents.map((accident) => (
                  <tr key={accident._id}>
                    <td>{new Date(accident.time_detected).toLocaleString()}</td>
                    <td>{accident.processedBy?.userName || 'N/A'}</td>
                    <td>{accident.status}</td>
                    <td>
                      {accident.screenshot ? (
                        <img src={accident.screenshot} alt="Accident Screenshot" className="w-24 h-auto object-cover rounded" />
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No accidents detected by this camera yet.</p>
          )}
        </>
      )}
    </>
  );
}
