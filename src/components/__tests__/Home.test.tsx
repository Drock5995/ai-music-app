import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../Home';

// Mock useAuth
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ session: { user: { id: '1', email: 'test@example.com' } } }),
}));

// Mock supabase client calls used in Home and FeaturedSongs
jest.mock('../../supabaseClient', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [] }) }) }),
    }),
  },
}));

test('renders Home main sections', async () => {
  render(<Home />);

  // Personalized header greeting
  expect(await screen.findByText(/My Music/i)).toBeInTheDocument();

  // Artist form heading
  expect(screen.getByText(/Create or Edit Artist/i)).toBeInTheDocument();

  // Upload section heading
  expect(screen.getByText(/Upload New Song/i)).toBeInTheDocument();
});
