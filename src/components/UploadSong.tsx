import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { Artist } from '../types';

interface UploadSongProps {
  onDataChange: () => void;
  artists: Artist[];
}

export default function UploadSong({ onDataChange, artists }: UploadSongProps) {
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [songName, setSongName] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<string | undefined>(undefined);
  const [lyrics, setLyrics] = useState('');
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);

  const handlePrimaryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPrimaryFile(event.target.files[0]);
    }
  };

  const handleSecondaryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSecondaryFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!primaryFile) {
      setErrorMessage('Please select a primary audio file.');
      return;
    }

    if (!session) {
      setErrorMessage('You must be logged in to upload a song.');
      return;
    }

    const file = primaryFile;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('song-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      let secondaryPath: string | null = null;
      if (secondaryFile) {
        const secondaryFileExt = secondaryFile.name.split('.').pop();
        const secondaryFileName = `${Math.random()}.${secondaryFileExt}`;
        const secondaryFilePath = `${secondaryFileName}`;

        const { error: secondaryUploadError } = await supabase.storage
          .from('song-files')
          .upload(secondaryFilePath, secondaryFile);

        if (secondaryUploadError) {
          throw secondaryUploadError;
        }

        secondaryPath = secondaryFilePath;
      }

      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = async () => {
        const duration = Math.round(audio.duration);
        const artistName = artists.find(a => a.id === Number(selectedArtist))?.name || 'Unknown Artist';

        const { error: dbError } = await supabase.from('songs').insert([
          {
            name: songName,
            artist: artistName,
            duration: duration,
            file_path: filePath,
            secondary_file_path: secondaryPath,
            user_id: session.user.id,
            artist_id: selectedArtist ? Number(selectedArtist) : null,
            lyrics: lyrics || null,
          },
        ]);

        if (dbError) {
          throw dbError;
        }

        setSuccessMessage('Song uploaded successfully!');
        setSongName('');
        setSelectedArtist(undefined);
        setLyrics('');
        setPrimaryFile(null);
        setSecondaryFile(null);
        onDataChange(); // Refresh the list
      };

    } catch (error: any) {
      setErrorMessage(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-section">
      <div className="section-header">
        <h2>Upload New Song</h2>
        <p>Add a new track to your music library</p>
      </div>

      {/* Inline success/error messages for better UX */}
      <div aria-live="polite" className="upload-notice">
        {successMessage && <div className="notice notice--success">{successMessage}</div>}
        {errorMessage && <div className="notice notice--error">{errorMessage}</div>}
      </div>

      <form className="upload-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="form-group">
          <label htmlFor="song-name" className="form-label">Song Title *</label>
          <input
            id="song-name"
            type="text"
            placeholder="Enter song title"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            className="inputField"
            required
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist-select" className="form-label">Artist *</label>
          <select
            id="artist-select"
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="inputField"
            required
            disabled={uploading}
          >
            <option value="">Select an artist</option>
            {artists.map(artist => (
              <option key={artist.id} value={artist.id}>{artist.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="lyrics" className="form-label">Lyrics (Optional)</label>
          <textarea
            id="lyrics"
            placeholder="Enter song lyrics..."
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="inputField"
            rows={4}
            disabled={uploading}
          />
        </div>

        <div className="file-upload-section">
          <h3>Audio Files</h3>

          <div className="file-input-group">
            <div className="file-input-container">
              <label htmlFor="song-upload" className="file-upload-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                {primaryFile ? primaryFile.name : 'Choose Primary Audio File *'}
              </label>
              <input
                type="file"
                id="song-upload"
                accept="audio/*"
                onChange={handlePrimaryUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </div>

            <div className="file-input-container">
              <label htmlFor="secondary-song-upload" className="file-upload-button file-upload-button--secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                {secondaryFile ? secondaryFile.name : 'Choose Secondary Audio File (Optional)'}
              </label>
              <input
                type="file"
                id="secondary-song-upload"
                accept="audio/*"
                onChange={handleSecondaryUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="upload-info">
            <p>Supported formats: MP3, WAV, M4A, FLAC</p>
            <p>Maximum file size: 50MB per file</p>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={uploading || !songName.trim() || !selectedArtist || !primaryFile}
            className="button button--primary"
          >
            {uploading ? (
              <>
                <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3"/>
                  <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Upload Song
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
