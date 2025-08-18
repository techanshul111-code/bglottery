import {
  users,
  results,
  bets,
  transactions,
  type User,
  type UpsertUser,
  type Result,
  type InsertResult,
  type Bet,
  type InsertBet,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management
  getAllUsers(): Promise<User[]>;
  updateUserTokenBalance(userId: string, newBalance: number): Promise<User>;
  updateUserStatus(userId: string, isActive: boolean): Promise<User>;
  
  // Results operations
  getResults(startDate?: string, endDate?: string): Promise<Result[]>;
  insertResult(result: InsertResult): Promise<Result>;
  getResultByDateTime(date: string, time: string): Promise<Result | undefined>;
  
  // Betting operations
  placeBet(bet: InsertBet): Promise<Bet>;
  getUserBets(userId: string): Promise<Bet[]>;
  updateBetResult(betId: number, isWin: boolean, winAmount?: number, resultId?: number): Promise<Bet>;
  getBetsByResult(resultId: number): Promise<Bet[]>;
  
  // Transaction operations
  addTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  
  // Analytics
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalBets: number;
    totalTokens: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User management
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserTokenBalance(userId: string, newBalance: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ tokenBalance: newBalance, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Results operations
  async getResults(startDate?: string, endDate?: string): Promise<Result[]> {
    let query = db.select().from(results);
    
    if (startDate && endDate) {
      query = query.where(and(
        gte(results.date, startDate),
        lte(results.date, endDate)
      ));
    } else if (startDate) {
      query = query.where(gte(results.date, startDate));
    } else if (endDate) {
      query = query.where(lte(results.date, endDate));
    }
    
    return await query.orderBy(desc(results.date), asc(results.time));
  }

  async insertResult(result: InsertResult): Promise<Result> {
    const [newResult] = await db.insert(results).values(result).returning();
    return newResult;
  }

  async getResultByDateTime(date: string, time: string): Promise<Result | undefined> {
    const [result] = await db
      .select()
      .from(results)
      .where(and(eq(results.date, date), eq(results.time, time)));
    return result;
  }

  // Betting operations
  async placeBet(bet: InsertBet): Promise<Bet> {
    const [newBet] = await db.insert(bets).values(bet).returning();
    return newBet;
  }

  async getUserBets(userId: string): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.createdAt));
  }

  async updateBetResult(betId: number, isWin: boolean, winAmount?: number, resultId?: number): Promise<Bet> {
    const [bet] = await db
      .update(bets)
      .set({ isWin, winAmount, resultId })
      .where(eq(bets.id, betId))
      .returning();
    return bet;
  }

  async getBetsByResult(resultId: number): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .where(eq(bets.resultId, resultId));
  }

  // Transaction operations
  async addTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // Analytics
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalBets: number;
    totalTokens: number;
  }> {
    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    const [activeUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isActive, true));
    
    const [totalBetsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bets);
    
    const [totalTokensResult] = await db
      .select({ sum: sql<number>`sum(token_balance)` })
      .from(users);

    return {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      totalBets: totalBetsResult.count,
      totalTokens: totalTokensResult.sum || 0,
    };
  }
}

export const storage = new DatabaseStorage();
