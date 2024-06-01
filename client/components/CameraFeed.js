import { useEffect, useState } from 'react';
import Spinner from "@/components/Spinner";
import { useRouter } from 'next/router';

export default function CameraFeed({ camera }) {
  const [videoSrc, setVideoSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (camera._id || camera.cameraUrl) {
      console.log(`Fetching video feed for camera ID: ${camera._id}`);
      const src = camera._id
        ? `http://localhost:5000/processed_video_feed?camera_id=${camera._id}`
        : `http://localhost:5000/processed_video_feed?camera_url=${encodeURIComponent(camera.cameraUrl)}`;
      setVideoSrc(src);
      console.log(`Video source set to: ${src}`);
    }
  }, [camera._id, camera.cameraUrl]);

  const handleLoad = () => {
    console.log('Image loaded');
    setIsLoading(false);
  };

  const handleError = (error) => {
    console.error('Error loading image:', error);
    setIsLoading(false);
  };

  const handleCardClick = () => {
    router.push(`/cameras/live/${camera._id}`);
  };

  return (
    <div className="camera-feed border border-gray-200 rounded p-2 relative hover:border-blue-500 cursor-pointer" onClick={handleCardClick}>
      <h2 className="text-sm font-bold mb-1">{camera.cameraName}</h2>
      {isLoading && (
        <div className="h-24 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <img
        src={videoSrc}
        alt={`Live feed for ${camera.cameraName}`}
        className="w-full h-40 object-cover rounded"
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      <p className="text-xs text-gray-900 mt-1">{camera.cameraFullAddress}</p>
      <p className="text-xs text-gray-500 mt-1"><em>{camera.description}</em></p>
    </div>
  );
}
