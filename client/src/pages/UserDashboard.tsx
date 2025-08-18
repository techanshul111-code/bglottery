import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogOut, Coins, Plus, Key } from "lucide-react";
import UserTabs from "@/components/UserTabs";
import AddMoneyModal from "@/components/AddMoneyModal";
import { useState } from "react";

export default function UserDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showAddMoney, setShowAddMoney] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'user')) {
      toast({
        title: "Unauthorized",
        description: "User access required. Logging in...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading || !isAuthenticated || user?.role !== 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      <div className="min-h-screen bhagya-background">
        <div style={{width: '1200px', textAlign: 'left', margin: '0', padding: '20px 20px'}}>
          {/* Dashboard Header */}
          <div className="bg-white p-6 rounded mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-black">User Dashboard</h2>
                <p className="text-gray-600">
                  Welcome back, {user.firstName || user.email}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="bhagya-button flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Balance & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-500 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Token Balance</p>
                  <p className="text-3xl font-bold">{user.tokenBalance || 0}</p>
                </div>
                <Coins className="text-3xl text-blue-200" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <button 
                onClick={() => setShowAddMoney(true)}
                className="w-full bhagya-button flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Money
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <button 
                className="w-full bhagya-button flex items-center justify-center gap-2"
                onClick={() => toast({ title: "Feature coming soon!", description: "Password change feature will be available soon." })}
              >
                <Key className="h-4 w-4" />
                Change Password
              </button>
            </div>
          </div>

          {/* User Tabs */}
          <UserTabs />
        </div>
      </div>

      <AddMoneyModal 
        isOpen={showAddMoney}
        onClose={() => setShowAddMoney(false)}
      />
    </>
  );
}
