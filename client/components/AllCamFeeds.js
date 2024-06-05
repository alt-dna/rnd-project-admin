import React from 'react';
import CameraFeed from '@/components/CameraFeed';
import AccidentLog from '@/components/AccidentLog';

export default function AllCamFeeds({ cameras }) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-5">All Live Camera Feeds</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="camera-container md:col-span-2">
          {cameras.map(camera => (
            <CameraFeed key={camera._id} camera={camera} />
          ))}
        </div>
        <AccidentLog />
      </div>
    </>
  );
}
