import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import MyBookings from "./pages/MyBookings";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ScrollToTop from "./components/ScrollToTop";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ScrollToTop />
        <div className="app-container">
          <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/dashboard" element={<MyBookings />} />
          <Route
            path="/organizer/dashboard"
            element={<OrganizerDashboard />}
          />
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Routes>

        <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;