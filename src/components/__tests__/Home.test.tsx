import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../Home';
import { MemoryRouter } from 'react-router-dom';

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
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  // Personalized header greeting shows the user's email
  expect(await screen.findByText(/test@example.com/i)).toBeInTheDocument();

  // Artist form heading
  expect(screen.getByText(/Create or Edit Artist/i)).toBeInTheDocument();

  // Upload section heading (one or more)
  const uploadHeadings = await screen.findAllByText(/Upload New Song/i);
  expect(uploadHeadings.length).toBeGreaterThan(0);
});
