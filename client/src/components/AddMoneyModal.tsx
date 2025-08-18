import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode } from "lucide-react";

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMoneyModal({ isOpen, onClose }: AddMoneyModalProps) {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMoneyMutation = useMutation({
    mutationFn: async (amount: number) => {
      await apiRequest("POST", "/api/user/add-money", { amount });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Money added successfully to your account",
      });
      setAmount("");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
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
        description: "Failed to add money",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    addMoneyMutation.mutate(amountNum);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Add Money</DialogTitle>
          <p className="text-gray-600 text-center">Scan QR code to add tokens</p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            {/* QR Code placeholder */}
            <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 mx-auto rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="text-4xl text-gray-400 mb-2 mx-auto" />
                <p className="text-sm text-gray-500">QR Code</p>
                <p className="text-xs text-gray-400 mt-1">Scan to pay</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Amount to Add (Tokens)</Label>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="focus:border-yellow-500"
              />
            </div>
            
            <div className="flex space-x-4">
              <Button 
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={addMoneyMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 lottery-button"
                disabled={addMoneyMutation.isPending}
              >
                {addMoneyMutation.isPending ? "Processing..." : "Confirm Payment"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
