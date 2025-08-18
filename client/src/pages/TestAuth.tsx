import { useAuth } from "@/hooks/useAuth";

export default function TestAuth() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (isLoading) {
    return (
      <div className="bhagya-background min-h-screen p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded">
          <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
          <p>Loading authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bhagya-background min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          </div>

          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">User Information</h2>
            {isAuthenticated && user ? (
              <div>
                <p><strong>ID:</strong> {(user as any).id || 'Not available'}</p>
                <p><strong>Email:</strong> {(user as any).email || 'Not available'}</p>
                <p><strong>First Name:</strong> {(user as any).firstName || 'Not available'}</p>
                <p><strong>Last Name:</strong> {(user as any).lastName || 'Not available'}</p>
                <p><strong>Role:</strong> {(user as any).role || 'Not available'}</p>
                <p><strong>Token Balance:</strong> {(user as any).tokenBalance || 0}</p>
              </div>
            ) : (
              <p>No user information available (not logged in)</p>
            )}
          </div>

          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">Actions</h2>
            <div className="space-x-4">
              {!isAuthenticated ? (
                <button 
                  onClick={handleLogin}
                  className="bhagya-button"
                >
                  Test Login
                </button>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="bhagya-button"
                >
                  Test Logout
                </button>
              )}
              
              <button 
                onClick={() => window.location.href = '/'}
                className="bhagya-button"
              >
                Back to Home
              </button>
            </div>
          </div>

          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">How to Test</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Test Login" to try logging in with Replit Auth</li>
              <li>After login, you should see your user information appear above</li>
              <li>The system should assign you a role (admin or user) automatically</li>
              <li>Click "Test Logout" to sign out</li>
              <li>Check if admin/user dashboards are accessible based on your role</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}