import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DonorDashboard from "./pages/donor/DonorDashboard";
import CreateListing from "./pages/donor/CreateListing";
import CharityDashboard from "./pages/charity/CharityDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

const Unauthorized = () => (
  <div className="p-8 text-2xl font-bold text-red-600">Unauthorized Access</div>
);

const Layout = ({ children }) => (
  <div>
    <Navbar />
    {children}
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/unauthorized" element={<Layout><Unauthorized /></Layout>} />

          <Route path="/donor/dashboard" element={
            <ProtectedRoute roles={["donor"]}>
              <Layout><DonorDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/donor/create-listing" element={
            <ProtectedRoute roles={["donor"]}>
              <Layout><CreateListing /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/charity/dashboard" element={
            <ProtectedRoute roles={["charity"]}>
              <Layout><CharityDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={["admin"]}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;