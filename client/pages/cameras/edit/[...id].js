import Layout from "@/components/Layout";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import axios from "axios";
import CameraForm from "@/components/CameraForm";

export default function EditCamera() {
    const [cameraInfo, setCameraInfo] = useState(null)
    const router = useRouter()
    const {id} = router.query;
    useEffect(() => {
        if (!id) {
            return
        }
        axios.get('/api/cameras?id='+id).then(res => {
            setCameraInfo(res.data)
        })
    }, [id]);
    return (
        <Layout>
            <h1>Edit Camera</h1>
            {cameraInfo && (
                <CameraForm {...cameraInfo}/>
            )}
        </Layout>
    )
}