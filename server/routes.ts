import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertResultSchema, insertBetSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  app.get('/api/results', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const results = await storage.getResults(
        startDate as string,
        endDate as string
      );
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users/:userId/tokens', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { userId } = req.params;
      const { amount, type } = req.body;
      
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const newBalance = targetUser.tokenBalance + amount;
      const updatedUser = await storage.updateUserTokenBalance(userId, newBalance);
      
      await storage.addTransaction({
        userId,
        type: type === 'add' ? 'admin_add' : 'admin_deduct',
        amount: Math.abs(amount),
        description: `Admin ${type} tokens`,
        balanceAfter: newBalance,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user tokens:", error);
      res.status(500).json({ message: "Failed to update tokens" });
    }
  });

  app.post('/api/admin/results', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertResultSchema.parse(req.body);
      const result = await storage.insertResult(validatedData);
      
      // Process any bets for this time slot
      await processResultBets(result);
      
      res.json(result);
    } catch (error) {
      console.error("Error creating result:", error);
      res.status(500).json({ message: "Failed to create result" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User routes
  app.get('/api/user/bets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bets = await storage.getUserBets(userId);
      res.json(bets);
    } catch (error) {
      console.error("Error fetching bets:", error);
      res.status(500).json({ message: "Failed to fetch bets" });
    }
  });

  app.post('/api/user/bets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertBetSchema.parse({
        ...req.body,
        userId
      });

      if (user.tokenBalance < validatedData.tokensAmount) {
        return res.status(400).json({ message: "Insufficient tokens" });
      }

      const bet = await storage.placeBet(validatedData);
      
      // Deduct tokens from user balance
      const newBalance = user.tokenBalance - validatedData.tokensAmount;
      await storage.updateUserTokenBalance(userId, newBalance);
      
      // Add transaction record
      await storage.addTransaction({
        userId,
        type: 'bet',
        amount: validatedData.tokensAmount,
        description: `Bet on ${validatedData.category} - ${validatedData.betNumber}`,
        balanceAfter: newBalance,
      });

      res.json(bet);
    } catch (error) {
      console.error("Error placing bet:", error);
      res.status(500).json({ message: "Failed to place bet" });
    }
  });

  app.get('/api/user/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/user/add-money', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newBalance = user.tokenBalance + amount;
      const updatedUser = await storage.updateUserTokenBalance(userId, newBalance);
      
      await storage.addTransaction({
        userId,
        type: 'add_money',
        amount,
        description: 'QR Code Payment',
        balanceAfter: newBalance,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error adding money:", error);
      res.status(500).json({ message: "Failed to add money" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to process bets when results are entered
async function processResultBets(result: any) {
  try {
    // Get all bets for this date and time
    const allBets = await storage.getUserBets(''); // We'll need to modify this to get all bets
    const relevantBets = allBets.filter(bet => 
      bet.date === result.date && bet.time === result.time
    );

    for (const bet of relevantBets) {
      const resultNumber = getResultNumberByCategory(result, bet.category);
      const isWin = bet.betNumber === resultNumber;
      const winAmount = isWin ? bet.tokensAmount * 9 : 0;
      
      await storage.updateBetResult(bet.id, isWin, winAmount, result.id);
      
      if (isWin) {
        // Add winnings to user balance
        const user = await storage.getUser(bet.userId);
        if (user) {
          const newBalance = user.tokenBalance + winAmount;
          await storage.updateUserTokenBalance(bet.userId, newBalance);
          
          await storage.addTransaction({
            userId: bet.userId,
            type: 'win',
            amount: winAmount,
            description: `Win from ${bet.category} bet`,
            balanceAfter: newBalance,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error processing result bets:", error);
  }
}

function getResultNumberByCategory(result: any, category: string): number | null {
  switch (category) {
    case 'XA': return result.xa;
    case 'XB': return result.xb;
    case 'XC': return result.xc;
    case 'XD': return result.xd;
    case 'XE': return result.xe;
    case 'XF': return result.xf;
    case 'XG': return result.xg;
    case 'XH': return result.xh;
    case 'XI': return result.xi;
    case 'XJ': return result.xj;
    default: return null;
  }
}
