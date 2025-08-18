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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dice6, History, Receipt, Info } from "lucide-react";

export default function UserTabs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Betting form state
  const [betForm, setBetForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "09:00 A.M",
    category: "XA",
    betNumber: "",
    tokensAmount: "",
  });

  // Fetch data
  const { data: bets, isLoading: betsLoading } = useQuery({
    queryKey: ["/api/user/bets"],
    retry: false,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/user/transactions"],
    retry: false,
  });

  // Mutations
  const placeBetMutation = useMutation({
    mutationFn: async (bet: any) => {
      await apiRequest("POST", "/api/user/bets", bet);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bet placed successfully",
      });
      setBetForm({
        date: new Date().toISOString().split('T')[0],
        time: "09:00 A.M",
        category: "XA",
        betNumber: "",
        tokensAmount: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/bets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: error.message || "Failed to place bet",
        variant: "destructive",
      });
    },
  });

  const handleBetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!betForm.betNumber || !betForm.tokensAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const bet = {
      ...betForm,
      betNumber: parseInt(betForm.betNumber),
      tokensAmount: parseInt(betForm.tokensAmount),
    };
    
    placeBetMutation.mutate(bet);
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

  const categories = ['XA', 'XB', 'XC', 'XD', 'XE', 'XF', 'XG', 'XH', 'XI', 'XJ'];

  return (
    <div className="bg-white rounded p-6">
      <Tabs defaultValue="betting" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="betting" className="flex items-center gap-2">
            <Dice6 size={16} />
            Place Bets
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} />
            Betting History
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Receipt size={16} />
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* Betting Tab */}
        <TabsContent value="betting" className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Place Your Bets</h3>
          
          <form onSubmit={handleBetSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Betting Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={betForm.date}
                      onChange={(e) => setBetForm(prev => ({ ...prev, date: e.target.value }))}
                      className="focus:border-yellow-500"
                    />
                  </div>
                  
                  <div>
                    <Label>Time Slot</Label>
                    <Select 
                      value={betForm.time} 
                      onValueChange={(value) => setBetForm(prev => ({ ...prev, time: value }))}
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
                  
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={betForm.category} 
                      onValueChange={(value) => setBetForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bet Amount & Number</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Bet Number (0-9)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="9"
                      value={betForm.betNumber}
                      onChange={(e) => setBetForm(prev => ({ ...prev, betNumber: e.target.value }))}
                      className="focus:border-yellow-500"
                      placeholder="Enter number 0-9"
                    />
                  </div>
                  
                  <div>
                    <Label>Tokens Amount</Label>
                    <Input
                      type="number"
                      min="1"
                      value={betForm.tokensAmount}
                      onChange={(e) => setBetForm(prev => ({ ...prev, tokensAmount: e.target.value }))}
                      className="focus:border-yellow-500"
                      placeholder="Enter tokens to bet"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Alert className="border-yellow-200 bg-yellow-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Win Multiplier:</strong> If your number matches, you'll receive 9x your bet amount!
              </AlertDescription>
            </Alert>
            
            <Button 
              type="submit"
              className="lottery-button"
              disabled={placeBetMutation.isPending}
            >
              {placeBetMutation.isPending ? "Placing Bet..." : "Place Bet"}
            </Button>
          </form>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Betting History</h3>
          
          {betsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading betting history...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-center">Category</TableHead>
                    <TableHead className="text-center">Bet Number</TableHead>
                    <TableHead className="text-center">Tokens Bet</TableHead>
                    <TableHead className="text-center">Result</TableHead>
                    <TableHead className="text-center">Winnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bets?.map((bet: any) => (
                    <TableRow key={bet.id}>
                      <TableCell>{bet.date}</TableCell>
                      <TableCell>{bet.time}</TableCell>
                      <TableCell className="text-center">{bet.category}</TableCell>
                      <TableCell className="text-center">{bet.betNumber}</TableCell>
                      <TableCell className="text-center">{bet.tokensAmount}</TableCell>
                      <TableCell className="text-center">
                        {bet.isWin === null ? (
                          <Badge variant="secondary">Pending</Badge>
                        ) : bet.isWin ? (
                          <Badge className="bg-green-500">Win</Badge>
                        ) : (
                          <Badge variant="destructive">Loss</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {bet.winAmount ? (
                          <span className="text-green-600">+{bet.winAmount}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!bets || bets.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No betting history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Transaction History</h3>
          
          {transactionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions?.map((transaction: any) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'add_money' || transaction.type === 'win' || transaction.type === 'admin_add'
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}>
                          {transaction.type === 'add_money' || transaction.type === 'win' || transaction.type === 'admin_add' ? (
                            <span className="text-white text-xl">+</span>
                          ) : (
                            <span className="text-white text-xl">-</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {transaction.type === 'add_money' && 'Money Added'}
                            {transaction.type === 'bet' && 'Bet Placed'}
                            {transaction.type === 'win' && 'Winning Payout'}
                            {transaction.type === 'admin_add' && 'Admin Credit'}
                            {transaction.type === 'admin_deduct' && 'Admin Debit'}
                          </p>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'add_money' || transaction.type === 'win' || transaction.type === 'admin_add'
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'add_money' || transaction.type === 'win' || transaction.type === 'admin_add' ? '+' : '-'}
                          {transaction.amount} Tokens
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!transactions || transactions.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No transactions found
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
