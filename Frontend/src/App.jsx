import { useState, useEffect } from 'react';
import { axiosInstance } from './axios';

function App() {
  const [isOn, setIsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await axiosInstance.get('/bulb-status');
        if (res.status === 200 && res.data.status) {
          setIsOn(res.data.status === 'on');
        }
      } catch {
        setError('Failed to fetch bulb status');
      } finally {
        setInitialLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const toggleBulb = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const newStatus = !isOn ? 'on' : 'off';

    try {
      const res = await axiosInstance.post('/toggle-bulb', { status: newStatus });
      if (res.status === 200) {
        setIsOn(newStatus === 'on');
      }
    } catch {
      setError('Failed to toggle bulb');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">IoT Bulb Controller 💡</h1>

      <button
        className={`w-24 h-24 rounded-full shadow-md transition-colors duration-300 focus:outline-none ${
          isOn ? 'bg-yellow-400' : 'bg-white'
        }`}
        onClick={toggleBulb}
        disabled={loading}
        aria-label="Toggle bulb"
      >
        {/* Optional icon or text */}
      </button>

      <p className="mt-4 text-lg text-gray-700">
        Bulb is <span className="font-semibold">{isOn ? 'ON' : 'OFF'}</span>
      </p>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export default App;
