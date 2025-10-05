import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadSong from '../UploadSong';

// Mock useAuth to provide a fake session
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ session: { user: { id: 'user-1' } } }),
}));

// Mock supabase client
jest.mock('../../supabaseClient', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
      }),
    },
    from: () => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

describe('UploadSong', () => {
  const artists = [{ id: 1, name: 'Artist One' }];

  test('shows error when no primary file is selected', async () => {
    const onDataChange = jest.fn();
    render(<UploadSong onDataChange={onDataChange} artists={artists as any} />);

    const title = screen.getByLabelText(/Song Title/i);
    const artistSelect = screen.getByLabelText(/Artist/i);
    fireEvent.change(title, { target: { value: 'My Song' } });
    fireEvent.change(artistSelect, { target: { value: '1' } });

    // The submit button is disabled when no file is selected. Submit the form programmatically
    const form = document.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      // the error message is rendered inside the upload-notice area
      expect(screen.getByText(/Please select a primary audio file/i)).toBeInTheDocument();
    });
    expect(onDataChange).not.toHaveBeenCalled();
  });

  test('happy path: uploads files and inserts song record', async () => {
    const onDataChange = jest.fn();
    render(<UploadSong onDataChange={onDataChange} artists={artists as any} />);

    const title = screen.getByLabelText(/Song Title/i);
    const artistSelect = screen.getByLabelText(/Artist/i);
    fireEvent.change(title, { target: { value: 'My Song' } });
    fireEvent.change(artistSelect, { target: { value: '1' } });

    // Mock URL.createObjectURL and global Audio to avoid DOM API errors in jsdom
    const originalURL = (global as any).URL;
    (global as any).URL = {
      ...(global as any).URL || {},
      createObjectURL: jest.fn(() => 'blob:fake'),
    };

    // Save original Audio
    const OriginalAudio = (global as any).Audio;
    // Audio mock: calling audio.src = ... will schedule onloadedmetadata after a tick
    (global as any).Audio = class {
      _src = '';
      onloadedmetadata: (() => void) | null = null;
      duration = 3.2;
      set src(v: string) {
        this._src = v;
        // Schedule the onloadedmetadata call after current tick so the component can set the handler
        setTimeout(() => {
          if (typeof this.onloadedmetadata === 'function') this.onloadedmetadata();
        }, 0);
      }
      get src() { return this._src; }
    } as any;

    // Mock file input by creating a File and firing change on the hidden input
    const file = new File(['audio content'], 'track.mp3', { type: 'audio/mpeg' });
    const hiddenInput = document.getElementById('song-upload') as HTMLInputElement;
    expect(hiddenInput).toBeTruthy();

    Object.defineProperty(hiddenInput, 'files', { value: [file] });
    fireEvent.change(hiddenInput);

    const uploadButton = screen.getByRole('button', { name: /upload song/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.queryByText(/Song uploaded successfully/i)).toBeInTheDocument();
    });
    expect(onDataChange).toHaveBeenCalled();

    // restore original Audio and URL
    (global as any).Audio = OriginalAudio;
    (global as any).URL = originalURL;
  });
});
