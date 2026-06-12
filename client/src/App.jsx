import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DonorDashboard from "./pages/donor/DonorDashboard";
import CreateListing from "./pages/donor/CreateListing";

const CharityDashboard = () => <div className="p-8 text-2xl font-bold text-blue-700">Charity Dashboard 🤝</div>;
const AdminDashboard = () => <div className="p-8 text-2xl font-bold text-purple-700">Admin Dashboard ⚙️</div>;
const Unauthorized = () => <div className="p-8 text-2xl font-bold text-red-600">Unauthorized Access</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/donor/dashboard" element={
            <ProtectedRoute roles={["donor"]}>
              <DonorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/donor/create-listing" element={
            <ProtectedRoute roles={["donor"]}>
              <CreateListing />
            </ProtectedRoute>
          } />
          <Route path="/charity/dashboard" element={
            <ProtectedRoute roles={["charity"]}>
              <CharityDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;