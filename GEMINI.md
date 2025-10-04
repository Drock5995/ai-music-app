# My Music Library Web App (Gemini Prompt Spec)

## **Project Overview**
Create a web app where users can upload music they’ve created (audio files), save and access those songs from anywhere, and play them right in the browser. Back-end storage is managed using Supabase (for audio files and song metadata). App should be clean, fast, and beginner-friendly.

---

## **Core Features**
- **User Authentication:** Sign-up and login using Supabase Auth (email/password, Google, or GitHub).
- **Music Upload:** Upload supported audio formats (MP3, WAV, etc.) via browser interface.
- **Cloud Storage:** Store audio files securely on Supabase Storage.
- **Metadata Management:** Save song details (file name, artist, upload date, duration, etc.) to Supabase Database.
- **Music Playback:** In-app music player with play, pause, skip, and progress.
- **Song List:** View uploaded songs; fetch real-time list from Supabase with URLs for playback.
- **Edit Song Info:** Change name and artist for uploaded tracks.
- **Delete Song:** Remove songs (file + metadata).
- **Create Playlists:** Organize songs into playlists. (Advanced: Edit/delete playlists, add/remove songs)

---

## **Technical Goals**
- **Frontend:** React + TypeScript
- **Backend:** Supabase (DB + Storage)
- **Responsive UI:** Works well on desktop & mobile
- **Developer Friendly:** Clear folder/file structure, helpful comments

---

## **Key Supabase Setup**
- Create `songs` table (id, user_id, name, artist, audioUrl, uploaded_at, duration, etc.)
- Create `playlists` table (id, user_id, name, created_at)
- Create `playlist_songs` table (id, playlist_id, song_id)
- Configure Supabase Storage bucket: `music-files`
- Secure Row Level Security policies for user privacy

---

## **Starter Questions for Gemini/Code Generation**
1. How do I set up Supabase tables and storage for this?
2. Can you generate React components for:
    - Song upload
    - Song list with individual playback
    - Edit song modal
    - Playlist creation and management
3. How should I organize my project folder?
4. What are security best practices for protecting user songs and data?
5. Provide API usage examples for uploading, fetching, editing, and deleting songs.

---

## **Initial User Story**
> I want to create an app that I can use to upload music I have created. This should be a web app where I will be able to access these songs and listen to them.

---

## **Supabase Environment Setup**
Add to `.env.local`:
  REACT_APP_SUPABASE_URL=https://zyjjkmrtvupggrbxvsnu.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5amprbXJ0dnVwZ2dyYnh2c251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0OTcyMjIsImV4cCI6MjA3NTA3MzIyMn0.wxpxokvdYOa_k2zkMP5eLFwFKepUZhpVguaZ8xysZ_Y


---

## **TODOs**
- [x] Set up Supabase backend (tables, storage, keys)
- [x] Scaffold React app layout
- [ ] Implement upload and playback
- [ ] Connect real-time song listing
- [ ] Build playlist features

---

*Use this spec to guide code assistant prompts, project README, or Gemini code requests!*  
