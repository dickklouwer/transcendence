"use client";

import Link from 'next/link';

export default function GC() {
    return (
        <div>
            <p>GC page</p>
            <br/>
            <Link className="bg-blue-500 text-white font-bold py-2 px-4 rounded" href={'/chats'}>
                Back
            </Link>
        </div>
    );
}
