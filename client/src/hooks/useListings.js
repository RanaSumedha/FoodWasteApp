import { create } from 'zustand';
import api from '../services/api';

const useListings = create((set, get) => ({
  listings: [],
  loading: false,
  error: null,

  fetchListings: async (lat, lng, radius = 10) => {
    set({ loading: true, error: null });
    try {
      const params = {};
      if (lat && lng) { params.lat = lat; params.lng = lng; params.radius = radius; }
      const res = await api.get('/listings', { params });
      set({ listings: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load listings', loading: false });
    }
  },

  createListing: async (formData) => {
    const res = await api.post('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    set(s => ({ listings: [res.data, ...s.listings] }));
    return res.data;
  },

  claimListing: async (listingId, scheduledPickupTime) => {
    const res = await api.post('/claims', { listingId, scheduledPickupTime });
    await get().fetchListings();
    return res.data;
  },

  cancelClaim: async (claimId) => {
    await api.delete(`/claims/${claimId}`);
    await get().fetchListings();
  },

  completeClaim: async (claimId) => {
    const res = await api.patch(`/claims/${claimId}/complete`);
    return res.data;
  }
}));

export default useListings;
