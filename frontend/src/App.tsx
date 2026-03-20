import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { usePlaylistStore } from "./store/playlistStore";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LibraryPage from "./pages/LibraryPage";
import PlaylistPage from "./pages/PlaylistPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useLikedStore } from "./store/likedStore";

function App() {
  const { token, loadUser } = useAuthStore();
  const { fetchPlaylists } = usePlaylistStore();

  useEffect(() => {
    loadUser();
  }, []);

  const { fetchLiked } = useLikedStore();

  useEffect(() => {
    if (token) {
      fetchPlaylists()
      fetchLiked()
    }
  }, [token])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!token ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!token ? <RegisterPage /> : <Navigate to="/" />}
        />
        <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="playlist/:id" element={<PlaylistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
