import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/Login";
import MyApplications from "./pages/MyApplications";
import HRApplications from "./pages/HRApplications";
import HRDashboard from "./pages/HRDashboard";
import HRJobs from "./pages/HRJobs";
import EditJob from "./pages/EditJob";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import CreateCV from "./pages/CreateCV";
import InformationPage from "./pages/InformationPage";
import CVUpload from "./components/CVUpload"; // Hoặc đường dẫn trang CV của bạn
import { getDashboardPath } from "./utils/roleRoutes";

// Import Navbar và Footer
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const user = readStoredUser();
  const role = user?.role?.toUpperCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
}

// Component phụ để tự động ẩn Navbar/Footer ở các trang quản trị
function LayoutWrapper() {
  const location = useLocation();

  // Các trang KHÔNG muốn hiện Navbar và Footer chung
  const hideLayoutPaths = [
    "/login",
    "/register",
    "/hr/dashboard",
    "/admin/dashboard",
    "/hr/jobs",
    "/hr/applications",
  ];

  const shouldHideLayout = hideLayoutPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <>
      {!shouldHideLayout && <Navbar />}

      <Routes>
        {/* Tất cả các Route của dự án đều nằm ở đây */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/about" element={<InformationPage page="about" />} />
        <Route
          path="/operating-regulations"
          element={<InformationPage page="regulations" />}
        />
        <Route path="/policies" element={<InformationPage page="policies" />} />
        <Route
          path="/create-cv"
          element={
            <ProtectedRoute allowedRoles={["CANDIDATE"]}>
              <CreateCV />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-cv"
          element={
            <ProtectedRoute allowedRoles={["CANDIDATE"]}>
              <CVUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute allowedRoles={["CANDIDATE"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Khu vực HR & Admin */}
        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/jobs"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <HRJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/jobs/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <EditJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/applications"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <HRApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!shouldHideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper />
    </BrowserRouter>
  );
}

export default App;
