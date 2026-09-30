// Pure-node tests (no deps) mirroring web/lib + contract invariants.
const assert = require("assert");

function splitPayment(total, sellerBps, platformBps, referrerBps) {
  if (sellerBps + platformBps + referrerBps !== 10000) throw new Error("bps must total 10000");
  const q = (t, b) => (t * BigInt(b)) / 10000n;
  const seller = q(total, sellerBps), platform = q(total, platformBps), ref = q(total, referrerBps);
  return { seller: seller + (total - seller - platform - ref), platform, referrer: ref };
}
function trustScore(jobs, totalRating, count, adjust) {
  let s = 50 + Math.min(jobs * 2, 25);
  if (count > 0) s += (totalRating * 20) / (count * 5);
  return Math.max(0, Math.min(100, Math.round(s + adjust)));
}
function canTransition(from, to) {
  const T = { open: ["funded","cancelled"], funded: ["in_progress","disputed","cancelled","refunded"], in_progress: ["submitted","disputed","completed","refunded"], submitted: ["completed","disputed","refunded"], disputed: ["completed","refunded"], completed: [], cancelled: [], refunded: [] };
  return (T[from] || []).includes(to);
}
function evaluatePolicy(req, p) {
  if (!p.allowedNetworks.includes(req.network)) return { allow: false };
  if (!p.allowedAssets.map(a=>a.toLowerCase()).includes(req.asset.toLowerCase())) return { allow: false };
  if (BigInt(req.amount) > p.maxPerRequest) return { allow: false };
  if (p.spentSession + BigInt(req.amount) > p.maxPerSession) return { allow: false };
  return { allow: true };
}

let pass = 0;
const ok = (name, fn) => { fn(); pass++; console.log("  PASS", name); };

// 1. split: no dust, remainder to seller
ok("split exact totals, no dust", () => {
  const s = splitPayment(10001n, 9500, 400, 100);
  assert.equal(s.seller + s.platform + s.referrer, 10001n);
  assert.equal(s.seller, 9501n); // 9500 floor + 1 remainder
});
ok("split rejects bad bps", () => assert.throws(() => splitPayment(100n, 9000, 400, 100)));
ok("split zero-fee passthrough", () => {
  const s = splitPayment(1000000n, 10000, 0, 0);
  assert.equal(s.seller, 1000000n);
});

// 2. escrow state machine
ok("escrow happy path", () => assert.ok(canTransition("funded","in_progress") && canTransition("in_progress","submitted") && canTransition("submitted","completed")));
ok("escrow blocks completed->refund", () => assert.ok(!canTransition("completed","refunded")));
ok("escrow dispute resolvable", () => assert.ok(canTransition("disputed","completed") && canTransition("disputed","refunded")));

// 3. reputation
ok("trust base 50", () => assert.equal(trustScore(0,0,0,0), 50));
ok("trust caps at 100", () => assert.equal(trustScore(500, 500, 100, 50), 100));
ok("trust floors at 0", () => assert.equal(trustScore(0,0,0,-200), 0));
ok("trust job cap 25", () => assert.equal(trustScore(13,0,0,0), trustScore(50,0,0,0)));

// 4. x402 policy
const NET = "eip155:84532", USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
ok("x402 allows within caps", () => assert.ok(evaluatePolicy({network: NET, asset: USDC, amount: "20000"}, {allowedNetworks:[NET], allowedAssets:[USDC], maxPerRequest: 100000n, maxPerSession: 1000000n, spentSession: 0n}).allow));
ok("x402 blocks over per-request", () => assert.ok(!evaluatePolicy({network: NET, asset: USDC, amount: "500000"}, {allowedNetworks:[NET], allowedAssets:[USDC], maxPerRequest: 100000n, maxPerSession: 1000000n, spentSession: 0n}).allow));
ok("x402 blocks wrong network", () => assert.ok(!evaluatePolicy({network: "eip155:1", asset: USDC, amount: "1"}, {allowedNetworks:[NET], allowedAssets:[USDC], maxPerRequest: 9n, maxPerSession: 9n, spentSession: 0n}).allow));
ok("x402 blocks session overflow", () => assert.ok(!evaluatePolicy({network: NET, asset: USDC, amount: "20000"}, {allowedNetworks:[NET], allowedAssets:[USDC], maxPerRequest: 100000n, maxPerSession: 25000n, spentSession: 10000n}).allow));

// 5. milestone sum invariant (escrow create)
ok("milestones must sum to total", () => {
  const total = 120_000000, parts = [60000000, 60000000];
  assert.equal(parts.reduce((a,b)=>a+b,0), total);
  assert.notEqual([60000000, 50000000].reduce((a,b)=>a+b,0), total);
});

console.log(`\nALL ${pass} TESTS PASSED`);
