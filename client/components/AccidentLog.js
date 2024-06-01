import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession, signIn, signOut } from 'next-auth/react';
import { formatDate } from "@/lib/utils";
import io from 'socket.io-client';
import Spinner from "@/components/Spinner";

export default function AccidentLog() {
  const { data: session, status } = useSession();
  const [accidents, setAccidents] = useState([]);
  const [highlightedAccident, setHighlightedAccident] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccidents = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/accidents');
        const unprocessedAccidents = response.data.filter(accident => accident.status === 'pending');
        setAccidents(unprocessedAccidents);
      } catch (error) {
        console.error("Error fetching accidents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccidents();

    const socket = io('http://localhost:5000');
    socket.on('new_accident', (newAccident) => {
      setAccidents((prevAccidents) => [newAccident, ...prevAccidents]);
      setHighlightedAccident(newAccident._id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleFalseAlarm = async (id) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/confirm_accident', {
        accident_id: id,
        isFalseAlarm: true,
        processedBy: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        }
      });
      setAccidents((prevAccidents) => prevAccidents.filter(acc => acc._id !== id));
    } catch (error) {
      console.error("Error updating accident status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/confirm_accident', {
        accident_id: id,
        isFalseAlarm: false,
        processedBy: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        }
      });
      setAccidents((prevAccidents) =>
        prevAccidents.map((acc) =>
          acc._id === id ? { ...acc, status: 'Processed', isProcessed: true } : acc
        )
      );
    } catch (error) {
      console.error("Error updating accident status:", error);
    } finally {
      setLoading(false);
    }
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
            className={`accident-card bg-white p-4 rounded shadow-sm mb-4 ${highlightedAccident === accident._id ? 'bg-red-200' : ''}`}
            onAnimationEnd={() => setHighlightedAccident(null)}
          >
            <div className="grid grid-cols-2 gap-4">
              <img src={accident.screenshot} alt="Screenshot" className="w-full h-40 object-cover rounded" />
              <div className="info-container">
                <p className="text-sm text-gray-600"><strong>Detected on:</strong> {formatDate(new Date(accident.time_detected))}</p>
                <p className="text-sm text-gray-600"><strong>Camera:</strong> {accident.cameraDetails?.cameraName}</p>
                <p className="text-sm text-gray-600"><strong>Address:</strong> {accident.location}</p>
                <p className="text-sm text-gray-600"><strong>Status:</strong> {accident.status}</p>
                <p className="text-sm text-gray-600"><strong>Processed By:</strong> {accident.processedBy?.userName || 'N/A'}</p>
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
    </div>
  );
}
