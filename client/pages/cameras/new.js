import CameraForm from "@/components/CameraForm"
import Layout from "@/components/Layout";
import {router} from "next/client";

export default function NewCamera() {
    const goBack = () => {
    router.push('/cameras');
  };
  return (
      <Layout>
          <button
            onClick={goBack}
            className="inline-block px-5 py-2 mb-5 bg-gray-200 text-gray-800 rounded text-center transition-all hover:bg-gray-400"
          >
            Back
          </button>
          <CameraForm />
      </Layout>
  );
}
