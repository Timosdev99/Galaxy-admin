import DashboardLayout from "../component/layout/dashboardLayout";
import MarketplaceManager from "./container/marketplace";

export default function ChatPage() {
  
  
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <MarketplaceManager  />
        </div>
      </DashboardLayout>
    );
  }