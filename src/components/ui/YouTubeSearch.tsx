import React, { useEffect, useState } from 'react';

interface YouTubeSearchProps {
  query: string;
  onSelect: (videoId: string) => void;
}

export function YouTubeSearch({ query, onSelect }: YouTubeSearchProps) {
  const [selected, setSelected] = useState<string | null>(null);
  type YouTubeResult = {
    id: { videoId: string };
    snippet: { title: string; thumbnails: { medium: { url: string } } };
  };
  const [results, setResults] = useState<YouTubeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);
      // Use Vite env variable
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || 'YOUR_API_KEY';
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        setError(
          'YouTube API key is missing or invalid. Please set VITE_YOUTUBE_API_KEY in your .env file.'
        );
        setLoading(false);
        setResults([]);
        return;
      }
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=6&key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) {
          setError('Failed to fetch YouTube results. Check your API key and network connection.');
          setLoading(false);
          setResults([]);
          return;
        }
        const data = await res.json();
        if (data.error) {
          setError(data.error.message || 'YouTube API error.');
          setLoading(false);
          setResults([]);
          return;
        }
        setResults(data.items || []);
        setLoading(false);
      } catch (err) {
        setError('Network error, API unreachable, or request timed out.');
        setLoading(false);
        setResults([]);
      }
    }
    fetchResults();
  }, [query]);

  if (loading) {
    return <div className="text-center text-orange-400 py-8">Loading YouTube results...</div>;
  }
  if (error) {
    return <div className="text-center text-red-400 py-8">{error}</div>;
  }
  if (!results.length) {
    return <div className="text-center text-orange-400 py-8">No YouTube results found.</div>;
  }
  if (selected) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-4">
        <iframe
          src={`https://www.youtube.com/embed/${selected}`}
          title="Selected YouTube Video"
          allowFullScreen
          className="w-full h-64 sm:h-80 md:h-96 rounded-xl border-2 border-orange-400 mb-4"
        />
        <button
          className="px-4 py-2 bg-gray-800 text-orange-400 rounded shadow hover:bg-orange-700 font-semibold"
          onClick={() => setSelected(null)}
        >Back to search results</button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
      {results.map((item) => (
        <div key={item.id.videoId} className="bg-gray-900 rounded-xl shadow-lg p-2 flex flex-col items-center aspect-video relative group cursor-pointer transition-all duration-200 hover:scale-105">
          <div className="w-full h-40 sm:h-48 md:h-56 rounded-xl overflow-hidden relative flex items-center justify-center">
            <img
              src={item.snippet.thumbnails.medium.url}
              alt={item.snippet.title}
              className="object-cover w-full h-full"
              style={{ aspectRatio: '16/9' }}
            />
            <button
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 group-hover:bg-opacity-60 transition"
              onClick={() => setSelected(item.id.videoId)}
              aria-label={`Play ${item.snippet.title}`}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#FF0000" fillOpacity="0.8" />
                <polygon points="26,20 50,32 26,44" fill="#fff" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-sm text-white text-center line-clamp-2 px-2">{item.snippet.title}</div>
        </div>
      ))}
    </div>
  );
}
