import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { Dashboard } from "./components/pages/Dashboard";
import { Vehicles } from "./components/pages/Vehicles";
import { Drivers } from "./components/pages/Drivers";
import { Assignments } from "./components/pages/Assignments";
import { Services } from "./components/pages/Services";
import { Maintenance } from "./components/pages/Maintenance";
import { Financial } from "./components/pages/Financial";
import { Settings } from "./components/pages/Settings";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "vehicles":
        return <Vehicles />;
      case "drivers":
        return <Drivers />;
      case "assignments":
        return <Assignments />;
      case "services":
        return <Services />;
      case "maintenance":
        return <Maintenance />;
      case "financial":
        return <Financial />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-[1920px] mx-auto">
              {renderPage()}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}