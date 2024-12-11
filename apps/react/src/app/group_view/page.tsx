"use client"

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { ExternalUser } from '@repo/db';
//import { fetchGet } from '';

export default function GroupViewPage() {
    const searchParams = useSearchParams();
    const userId = searchParams?.get('id');

    useEffect(() => {
        fetchGet<ExternalUser>(`/api/getExternalUser?id=${userId}`)
            .then((res) => {
                setExternalUser(res);
                setLoading(false);
                console.log('ExternalUser: ', res);
            })
            .catch((error) => {
                console.log('Error: ', error);
                setLoading(false);
            })
    }, [userId]);

    return (
        <div>
            <h1>GroupViewPage</h1>
        </div>
    );
}
