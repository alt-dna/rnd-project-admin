import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import axios from "axios";

export default function DeleteCamera() {
  const router = useRouter();
  const [cameraInfo, setCameraInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const { id } = router.query;

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchCameraInfo = async () => {
      try {
        const res = await axios.get('/api/cameras?id=' + id);
        setCameraInfo(res.data);
      } catch (error) {
        setError("Error fetching camera info");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCameraInfo();
  }, [id]);

  function goBack() {
    router.push('/cameras');
  }

  async function deleteCamera() {
    setIsDeleting(true);
    try {
      await axios.delete('/api/cameras?id=' + id);
      goBack();
    } catch (error) {
      setError("Error deleting camera");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-600">{error}</div>
        <div className="flex gap-2 justify-center">
          <button className="btn-default" onClick={goBack}>Back</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-center">
        You <em className="text-red-500">cannot</em> undo your action. Do you really want to delete &quot;{cameraInfo?.cameraName}&quot;?
      </h1>
      <div className="flex gap-2 justify-center">
        <button className="btn-red" onClick={deleteCamera} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Yes"}
        </button>
        <button className="btn-default" onClick={goBack} disabled={isDeleting}>No</button>
      </div>
    </Layout>
  );
}
