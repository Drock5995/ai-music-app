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
    if (!primaryFile) {
      alert('Please select a primary file.');
      return;
    }

    if (!session) {
      alert('You must be logged in to upload a song.');
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

        alert('Song uploaded successfully!');
        setSongName('');
        setSelectedArtist(undefined);
        setLyrics('');
        setPrimaryFile(null);
        setSecondaryFile(null);
        onDataChange(); // Refresh the list
      };

    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload a New Song</h2>
      <input
        type="text"
        placeholder="Song Name"
        value={songName}
        onChange={(e) => setSongName(e.target.value)}
        className="inputField"
      />
      <select
        value={selectedArtist}
        onChange={(e) => setSelectedArtist(e.target.value)}
        className="inputField"
      >
        <option value="">Select an Artist</option>
        {artists.map(artist => (
          <option key={artist.id} value={artist.id}>{artist.name}</option>
        ))}
      </select>
      <textarea
        placeholder="Lyrics (optional)"
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        className="inputField"
        rows={4}
      />
      <label htmlFor="song-upload" className="button">
        {uploading ? 'Uploading...' : 'Choose Primary File'}
      </label>
      <input
        type="file"
        id="song-upload"
        accept="audio/*"
        onChange={handlePrimaryUpload}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      <label htmlFor="secondary-song-upload" className="button">
        {uploading ? 'Uploading...' : 'Choose Secondary File (optional)'}
      </label>
      <input
        type="file"
        id="secondary-song-upload"
        accept="audio/*"
        onChange={handleSecondaryUpload}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      <button onClick={handleSubmit} disabled={uploading} className="button">
        {uploading ? 'Uploading...' : 'Upload Song'}
      </button>
    </div>
  );
}
