import { useState } from 'react';
import api from '../services/api';
import useAuth from './useAuth';

export default function useGeolocation() {
  const { user } = useAuth();
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { longitude, latitude } = pos.coords;
        setCoords([longitude, latitude]);
        if (user) {
          try {
            await api.patch(`/users/${user.id}/location`, { coordinates: [longitude, latitude] });
          } catch (e) {
            setError(e.response?.data?.message || 'Failed to save location');
          }
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  };

  return { coords, loading, error, requestLocation };
}
