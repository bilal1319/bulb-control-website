import { useState, useEffect } from 'react'
import { axiosInstance } from './axios'

function App() {
  const [isOn, setIsOn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true) // NEW for initial fetch
  const [error, setError] = useState(null)

  // Fetch initial bulb status from backend on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axiosInstance.get('/bulb-status')
        if (res.status === 200 && res.data.status) {
          setIsOn(res.data.status === 'on')
        }
      } catch (err) {
        console.error('Fetch status error:', err)
        setError('Failed to fetch bulb status')
      } finally {
        setInitialLoading(false)  // Hide full-page loader here
      }
    }
    fetchStatus()
  }, [])

  const toggleBulb = async () => {
    if (loading) return

    setLoading(true)
    setError(null)
    const newStatus = !isOn

    try {
      const res = await axiosInstance.post('/toggle-bulb', {
        status: newStatus ? 'on' : 'off',
      })
      if (res.status === 200) {
        setIsOn(newStatus)
      }
      console.log(`Toggle response: ${res.data.message}`)
    } catch (err) {
      console.error('Toggle error:', err)
      setError('Failed to toggle bulb')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    // Full page loading indicator while fetching initial status
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        {/* Simple spinner, you can customize or add text */}
      </div>
    )
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
        {/* Optional icon */}
      </button>

      <p className="mt-4 text-lg text-gray-700">
        Bulb is <span className="font-semibold">{isOn ? 'ON' : 'OFF'}</span>
      </p>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  )
}

export default App
