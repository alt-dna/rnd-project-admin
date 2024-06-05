import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession, signIn } from 'next-auth/react';
import { formatDate } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import ImageEnlarger from "@/components/ImageEnlarger";

export default function AccidentLog() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [accidents, setAccidents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [highlightedAccidents, setHighlightedAccidents] = useState(new Set());

  useEffect(() => {
    const fetchAccidents = async () => {
      try {
        console.log("Fetching initial accidents...");
        const response = await axios.get('/api/accidents');
        const unprocessedAccidents = response.data.filter(accident => accident.status === 'pending');

        setAccidents(unprocessedAccidents);
        console.log("Initial accidents fetched:", unprocessedAccidents);
      } catch (error) {
        console.error("Error fetching accidents:", error);
      } finally {
        setLoading(false);
      }
    };

    const pollAccidents = async () => {
      try {
        console.log("Polling for new accidents...");
        const response = await axios.get('/api/accidents');
        const newAccidents = response.data.filter(accident => accident.status === 'pending');

        // Identify new accidents
        const newAccidentIds = new Set(newAccidents.map(accident => accident._id));
        const prevAccidentIds = new Set(accidents.map(accident => accident._id));
        const newDetectedAccidents = Array.from(newAccidentIds).filter(id => !prevAccidentIds.has(id));

        // Update highlighted accidents
        if (newDetectedAccidents.length > 0) {
          setHighlightedAccidents(prev => new Set([...prev, ...newDetectedAccidents]));
        }

        setAccidents(newAccidents);
      } catch (error) {
        console.error("Error polling accidents:", error);
      }
    };

    fetchAccidents();

    const intervalId = setInterval(pollAccidents, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleFalseAlarm = async (id) => {
    if (!session) return;

    setLoading(true);
    try {
      const accident = accidents.find(acc => acc._id === id);
      if (!accident) throw new Error('Accident not found');

      await axios.post('/api/accidents', {
        accident_id: id,
        isFalseAlarm: true,
        processedBy: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        },
        time_detected: accident.time_detected
      });
      setAccidents((prevAccidents) => prevAccidents.filter(acc => acc._id !== id));
      setHighlightedAccidents((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    } catch (error) {
      console.error("Error updating accident status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id) => {
    if (!session) return;

    setLoading(true);
    try {
      const accident = accidents.find(acc => acc._id === id);
      if (!accident) throw new Error('Accident not found');

      await axios.post('/api/accidents', {
        accident_id: id,
        isFalseAlarm: false,
        processedBy: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        },
        time_detected: accident.time_detected // Include the time_detected field
      });
      setAccidents((prevAccidents) =>
        prevAccidents.map((acc) =>
          acc._id === id ? { ...acc, status: 'processed', isProcessed: true } : acc
        )
      );
      setHighlightedAccidents((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    } catch (error) {
      console.error("Error updating accident status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageSrc) => {
    setModalImage(imageSrc);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalImage('');
  };

  if (status === "loading") {
    return <Spinner fullWidth />;
  }

  if (status === "unauthenticated") {
    return <div>You need to sign in to view this page. <button onClick={() => signIn()}>Sign in</button></div>;
  }

  return (
    <div className="accident-log">
      <h2 className="text-xl font-bold mb-4">Accident Log</h2>
      {loading && <Spinner fullWidth />}
      <div className="grid grid-cols-1 gap-4">
        {accidents.map((accident) => (
          <div
            key={accident._id}
            className={`accident-card bg-white p-4 rounded shadow-sm mb-4 ${highlightedAccidents.has(accident._id) ? 'bg-red-100 border border-red-500' : ''}`}
          >
            <div className="grid grid-cols-2 gap-4">
              <img src={accident.screenshot}
                   alt="Screenshot"
                   className="w-full h-40 object-cover rounded cursor-pointer"
                   onClick={() => handleImageClick(accident.screenshot)}
              />
              <div className="info-container">
                <p className="text-sm text-gray-600"><strong>Detected on:</strong> {formatDate(new Date(accident.time_detected))}</p>
                <p className="text-sm text-gray-600"><strong>Camera:</strong> {accident.cameraDetails?.cameraName}</p>
                <p className="text-sm text-gray-600"><strong>Address:</strong> {accident.location}</p>
                <p className="text-sm text-gray-600"><strong>Status:</strong> {accident.status}</p>
                <p className="text-sm text-gray-600"><strong>Processed By:</strong> {accident.processedBy?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="buttons mt-4 flex justify-between items-center">
              {!accident.isProcessed && (
                <>
                  <button onClick={() => handleFalseAlarm(accident._id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded">False Alarm</button>
                  <button onClick={() => handleProcess(accident._id)} className="px-2 py-1 bg-green-500 text-white text-xs rounded">Process</button>
                </>
              )}
              {accident.isProcessed && (
                <p className="text-sm italic">{accident.status}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <ImageEnlarger show={showModal} onClose={handleCloseModal}>
        <img src={modalImage} alt="Expanded screenshot" className="w-full h-auto" />
      </ImageEnlarger>
    </div>
  );
}
