import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Spinner from '@/components/Spinner';

export default function CameraFeed({ camera }) {
  const [frameSrc, setFrameSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (camera._id || camera.cameraUrl) {
      const src = camera._id
        ? `http://localhost:5000/processed_video_feed?camera_id=${camera._id}`
        : `http://localhost:5000/processed_video_feed?camera_url=${encodeURIComponent(camera.cameraUrl)}`;
      setFrameSrc(src);
      setIsLoading(true);
    }
  }, [camera._id, camera.cameraUrl]);

  const handleCardClick = () => {
    router.push(`/cameras/live/${camera._id}`);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
  };

  return (
    <div
      className="camera-feed border border-gray-200 rounded p-2 relative hover:border-blue-500 hover:bg-blue-100 hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      <h2 className="text-sm font-bold mb-1">{camera.cameraName}</h2>
      {isLoading && (
        <div className="h-40 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <img
        src={frameSrc}
        alt={`Live feed for ${camera.cameraName}`}
        className={`w-full h-40 object-cover rounded ${isLoading ? 'hidden' : 'block'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      <p className="text-xs text-gray-900 mt-1">{camera.cameraFullAddress}</p>
      <p className="text-xs text-gray-500 mt-1"><em>{camera.description}</em></p>
    </div>
  );
}
