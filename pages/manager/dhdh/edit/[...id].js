
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const Dhdh = dynamic(() => import("@/components/Dhdh"), { ssr: false });

export default function EditDhdh() {


    const router = useRouter();
    const { id } = router.query;

    const [DhdhInfo, setDhdhInfo] = useState(null);

    useEffect(() => {
        if (!id) {
            return;
        } else {
            axios.get('/api/dhdh?id=' + id).then(response => {
                setDhdhInfo(response.data)
            })
        }
    }, [id])

    return <>

        <div>
            {
                DhdhInfo && (
                    <Dhdh {...DhdhInfo} />
                )
            }
        </div>
    </>
}

