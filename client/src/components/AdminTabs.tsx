import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Activity, Edit, Coins, Trash2 } from "lucide-react";

export default function AdminTabs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Result form state
  const [resultForm, setResultForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "09:00 A.M",
    xa: "",
    xb: "",
    xc: "",
    xd: "",
    xe: "",
    xf: "",
    xg: "",
    xh: "",
    xi: "",
    xj: "",
  });

  // Fetch data
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  // Mutations
  const createResultMutation = useMutation({
    mutationFn: async (result: any) => {
      await apiRequest("POST", "/api/admin/results", result);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Result saved successfully",
      });
      setResultForm({
        date: new Date().toISOString().split('T')[0],
        time: "09:00 A.M",
        xa: "",
        xb: "",
        xc: "",
        xd: "",
        xe: "",
        xf: "",
        xg: "",
        xh: "",
        xi: "",
        xj: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save result",
        variant: "destructive",
      });
    },
  });

  const updateTokensMutation = useMutation({
    mutationFn: async ({ userId, amount, type }: { userId: string; amount: number; type: 'add' | 'deduct' }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/tokens`, { 
        amount: type === 'add' ? amount : -amount, 
        type 
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User tokens updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update tokens",
        variant: "destructive",
      });
    },
  });

  const handleResultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedResult = {
      ...resultForm,
      xa: resultForm.xa ? parseInt(resultForm.xa) : null,
      xb: resultForm.xb ? parseInt(resultForm.xb) : null,
      xc: resultForm.xc ? parseInt(resultForm.xc) : null,
      xd: resultForm.xd ? parseInt(resultForm.xd) : null,
      xe: resultForm.xe ? parseInt(resultForm.xe) : null,
      xf: resultForm.xf ? parseInt(resultForm.xf) : null,
      xg: resultForm.xg ? parseInt(resultForm.xg) : null,
      xh: resultForm.xh ? parseInt(resultForm.xh) : null,
      xi: resultForm.xi ? parseInt(resultForm.xi) : null,
      xj: resultForm.xj ? parseInt(resultForm.xj) : null,
    };
    createResultMutation.mutate(formattedResult);
  };

  const handleTokenUpdate = (userId: string, amount: number, type: 'add' | 'deduct') => {
    updateTokensMutation.mutate({ userId, amount, type });
  };

  const timeSlots = [
    '09:00 A.M', '09:15 A.M', '09:30 A.M', '09:45 A.M', '10:00 A.M',
    '10:15 A.M', '10:30 A.M', '10:45 A.M', '11:00 A.M', '11:20 A.M',
    '11:40 A.M', '12:00 P.M', '12:20 P.M', '12:40 P.M', '01:00 P.M',
    '01:20 P.M', '01:40 P.M', '02:00 P.M', '02:20 P.M', '02:40 P.M',
    '03:00 P.M', '03:20 P.M', '03:40 P.M', '04:00 P.M', '04:20 P.M',
    '04:40 P.M', '05:00 P.M', '05:20 P.M', '05:40 P.M', '06:00 P.M',
    '06:20 P.M', '06:40 P.M', '07:00 P.M', '07:20 P.M', '07:40 P.M',
    '08:00 P.M', '08:20 P.M', '08:40 P.M', '09:00 P.M', '09:20 P.M', '09:40 P.M'
  ];

  return (
    <div className="bg-white rounded p-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            User Management
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Trophy size={16} />
            Results Entry
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity size={16} />
            Activity Monitor
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">User Management</h3>
          </div>

          {usersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Tokens</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {user.tokenBalance}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTokenUpdate(user.id, 100, 'add')}
                          >
                            <Coins size={14} className="mr-1" />
                            +100
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTokenUpdate(user.id, 100, 'deduct')}
                          >
                            <Coins size={14} className="mr-1" />
                            -100
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Results Entry Tab */}
        <TabsContent value="results" className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Enter Results</h3>
          
          <form onSubmit={handleResultSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Date & Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={resultForm.date}
                      onChange={(e) => setResultForm(prev => ({ ...prev, date: e.target.value }))}
                      className="focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <Label>Time Slot</Label>
                    <Select 
                      value={resultForm.time} 
                      onValueChange={(value) => setResultForm(prev => ({ ...prev, time: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Result Numbers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {['xa', 'xb', 'xc', 'xd', 'xe', 'xf', 'xg', 'xh', 'xi', 'xj'].map(key => (
                      <div key={key}>
                        <Label className="text-xs text-gray-600 mb-1 block uppercase">
                          {key}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          value={resultForm[key as keyof typeof resultForm]}
                          onChange={(e) => setResultForm(prev => ({ 
                            ...prev, 
                            [key]: e.target.value 
                          }))}
                          className="focus:border-yellow-500"
                          placeholder="0-9"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Button 
              type="submit"
              className="lottery-button"
              disabled={createResultMutation.isPending}
            >
              {createResultMutation.isPending ? "Saving..." : "Save Results"}
            </Button>
          </form>
        </TabsContent>

        {/* Activity Monitor Tab */}
        <TabsContent value="activity" className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">User Activity Monitor</h3>
          
          {statsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading statistics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                    </div>
                    <Users className="text-3xl text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Active Bets</p>
                      <p className="text-3xl font-bold">{stats?.totalBets || 0}</p>
                    </div>
                    <Activity className="text-3xl text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">Total Tokens</p>
                      <p className="text-3xl font-bold">{stats?.totalTokens || 0}</p>
                    </div>
                    <Coins className="text-3xl text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
