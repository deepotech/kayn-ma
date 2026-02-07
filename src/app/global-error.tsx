'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h2>Something went wrong!</h2>
                    <button onClick={() => reset()} className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
