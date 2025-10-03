import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';

interface UploadSongProps {
  onDataChange: () => void;
}

export default function UploadSong({ onDataChange }: UploadSongProps) {
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    if (!session) {
      alert('You must be logged in to upload a song.');
      return;
    }

    const file = event.target.files[0];
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

      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = async () => {
        const duration = Math.round(audio.duration);

        const { error: dbError } = await supabase.from('songs').insert([
          {
            name: songName,
            artist: artist,
            duration: duration,
            file_path: filePath,
            user_id: session.user.id,
          },
        ]);

        if (dbError) {
          throw dbError;
        }

        alert('Song uploaded successfully!');
        setSongName('');
        setArtist('');
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
      <input
        type="text"
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        className="inputField"
      />
      <label htmlFor="song-upload" className="button">
        {uploading ? 'Uploading...' : 'Choose File'}
      </label>
      <input
        type="file"
        id="song-upload"
        accept="audio/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ display: 'none' }}
      />
    </div>
  );
}