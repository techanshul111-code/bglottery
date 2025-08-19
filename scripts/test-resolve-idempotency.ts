/**
 * Test script: insert a result and verify resolveBetAtomic is idempotent.
 *
 * Usage:
 *  - npx tsx scripts/test-resolve-idempotency.ts
 *  - Or: node -r ts-node/register scripts/test-resolve-idempotency.ts
 *
 * This script will:
 *  1) Insert a deterministic test result for the current date/time slot (adjust if needed).
 *  2) Fetch pending bets for that date/time.
 *  3) For each pending bet, call storage.resolveBetAtomic(...) twice and verify the user's balance
 *     and transaction records are only updated once.
 *
 * Note: This test mutates your DB. Run against a dev/test database.
 */

import { storage } from "../server/storage";

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

async function main() {
  console.log('Starting idempotency test for resolveBetAtomic');

  // Use a test date/time. Adjust as necessary to match pending bets in your DB.
  const testDate = new Date().toISOString().slice(0,10); // YYYY-MM-DD
  const testTime = '10:00'; // pick a slot you have bets for, or create bets first

  // Insert a result for the slot
  const newResultData = {
    date: testDate,
    time: testTime,
    xa: 1, xb: 2, xc: 3, xd: 4, xe: 5,
    xf: 6, xg: 7, xh: 8, xi: 9, xj: 0,
  } as any;

  let result: any;
  try {
    result = await storage.insertResult(newResultData);
    console.log('Inserted result:', result.id ?? '(no id returned)');
  } catch (err: any) {
    console.error('Failed to insert result:', err?.message ?? err);
    process.exit(2);
  }

  // Fetch pending bets for this slot
  const pendingBets = await storage.getPendingBetsByDateTime(testDate, testTime);
  if (!pendingBets || pendingBets.length === 0) {
    console.warn('No pending bets found for', testDate, testTime);
    console.warn('Create test bets for this slot first (use placeBetAtomic) and re-run the script.');
    process.exit(0);
  }

  console.log(`Found ${pendingBets.length} pending bets. Running idempotency checks...`);

  let failures = 0;

  for (const bet of pendingBets) {
    console.log('---');
    console.log('Bet id:', bet.id, 'user:', bet.userId, 'category:', bet.category, 'betNumber:', bet.betNumber, 'tokens:', bet.tokensAmount);

    const userBefore = await storage.getUser(bet.userId);
    const txsBefore = await storage.getUserTransactions(bet.userId);

    const resultNumber = getResultNumberByCategory(result, bet.category);
    const isWin = bet.betNumber === resultNumber;
    const winAmount = isWin ? bet.tokensAmount * 9 : 0;

    try {
      // First resolution
      await storage.resolveBetAtomic(bet.id, result.id, isWin, winAmount);
      const userAfterFirst = await storage.getUser(bet.userId);
      const txsAfterFirst = await storage.getUserTransactions(bet.userId);

      // Second resolution (should be a no-op)
      await storage.resolveBetAtomic(bet.id, result.id, isWin, winAmount);
      const userAfterSecond = await storage.getUser(bet.userId);
      const txsAfterSecond = await storage.getUserTransactions(bet.userId);

      const balanceDeltaFirst = (userAfterFirst?.tokenBalance ?? 0) - (userBefore?.tokenBalance ?? 0);
      const balanceDeltaSecond = (userAfterSecond?.tokenBalance ?? 0) - (userAfterFirst?.tokenBalance ?? 0);

      const txCountDeltaFirst = (txsAfterFirst?.length ?? 0) - (txsBefore?.length ?? 0);
      const txCountDeltaSecond = (txsAfterSecond?.length ?? 0) - (txsAfterFirst?.length ?? 0);

      console.log('balanceDeltaFirst:', balanceDeltaFirst, 'expected:', winAmount);
      console.log('balanceDeltaSecond (should be 0):', balanceDeltaSecond);
      console.log('txCountDeltaFirst:', txCountDeltaFirst, 'txCountDeltaSecond:', txCountDeltaSecond);

      const expectedBalanceDelta = isWin ? winAmount : 0;

      if (balanceDeltaFirst !== expectedBalanceDelta) {
        console.error(`FAIL: first resolution balance delta ${balanceDeltaFirst} !== expected ${expectedBalanceDelta}`);
        failures++;
      }
      if (balanceDeltaSecond !== 0) {
        console.error(`FAIL: second resolution changed balance by ${balanceDeltaSecond}`);
        failures++;
      }
      if (txCountDeltaSecond !== 0) {
        console.error(`FAIL: second resolution created ${txCountDeltaSecond} extra transaction(s)`);
        failures++;
      }

      if (failures === 0) {
        console.log('OK: Bet resolved idempotently');
      }

    } catch (err: any) {
      console.error('Error resolving bet:', err?.message ?? err);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`Idempotency test completed with ${failures} failure(s)`);
    process.exit(3);
  }

  console.log('Idempotency test passed for all pending bets.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Unhandled error in idempotency test:', err);
  process.exit(1);
});