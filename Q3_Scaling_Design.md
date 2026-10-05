# ShelfLife at Scale — System Design (Q3)

## a) High-level architecture

```text
 Members / Librarians
        |
        v
 CDN + WAF  ----------------------> Static React app (CDN object storage)
        |
        v
 Global load balancer
        |
        v
 Autoscaling, stateless API instances (REST; campus-aware routing)
        |                 |                       |
        |                 v                       v
        |           Redis cluster             Queue / event bus
        |          (search cache)        (notifications, analytics,
        |                 |                audit/index refresh)
        v                 v                       v
 MongoDB sharded cluster <-------------------- Worker pool
 (replica sets per shard; primary writes,
  secondary reads where eventual consistency is acceptable)
```

The CDN serves static assets close to users; the load balancer distributes API
requests across stateless instances, which can scale horizontally. MongoDB
stores the authoritative catalog, campus inventory, members, and borrow
records. Each shard is replicated for availability and failover. Redis is a
disposable read cache, never the authority for inventory. A queue and workers
take non-critical work (such as email, analytics, and search-index refresh)
off the request path. Issue and return operations remain synchronous so users
receive an immediate success or an out-of-stock/conflict response.

## b) MongoDB topology and shard keys

Use a managed MongoDB sharded cluster with replica-set-backed shards. At 500
campuses, 2 million members, and expected growth, sharding provides room to
scale storage and throughput horizontally; replicas alone scale availability,
not write capacity. Begin with a modest shard count and add capacity based on
measured load. Add an explicit `campusId` to campus-scoped inventory and
borrow records; the current single-library schemas do not yet contain it.

* **Book/inventory:** `{ campusId: 1, _id: "hashed" }`. Campus-scoped requests
  include `campusId`, while the hashed book ID distributes books within a
  campus instead of putting an entire campus on one shard. Keep inventory
  campus-specific; a popular title can still be a hot document, but its
  correctness is protected by atomic updates. If bibliographic metadata is
  shared network-wide, keep it in a separate catalog collection keyed by a
  normalized ISBN rather than duplicating global uniqueness rules in
  campus inventory.
* **BorrowRecord:** `{ campusId: 1, memberId: "hashed" }`. Member history
  requests include both values and target a shard; hashing spreads members
  across shards. Include campus and member IDs in queries and indexes. Queries
  that omit them may scatter to multiple shards, so route/API contracts should
  carry campus context.

Create supporting indexes for common campus search filters, ISBN/catalog
lookups, and member history ordering. Confirm shard-key and unique-index
constraints against the MongoDB version/provider before rollout; preserve
network-wide uniqueness in the global catalog if required.

## c) Read-heavy operation and cache

The most read-heavy operation is **book search/listing**: users repeatedly
search the catalog and check what a campus offers. Cache search result IDs and
stable book fields (title, author, genre) in Redis using a key containing
`campusId`, normalized query, filters, sort, and page. Cache availability only
as a short-lived display hint; every issue request must check MongoDB.

Use a 60-second TTL as a backstop. Evict affected campus/book search entries
when a book is added/edited or inventory changes on issue/return; publish
invalidation events to all API instances. If an invalidation is missed, the
short TTL bounds stale search results. Do not cache member eligibility or use
cached availability to approve a loan.

## d) Safe concurrent issue operation

Reserve a copy with one conditional MongoDB update:

```js
findOneAndUpdate(
  { _id: bookId, campusId, availableCopies: { $gt: 0 } },
  { $inc: { availableCopies: -1 } }
)
```

MongoDB applies the predicate and decrement atomically to that document.
Concurrent requests for the last copy cannot both match: one decrements it
from 1 to 0, and the others match no document and return out-of-stock. This is
the invariant that prevents negative inventory. Create the BorrowRecord only
when reservation succeeds, and use a MongoDB transaction for the reservation
plus record insert when both must commit or roll back together. Retry
transient transaction conflicts and return a conflict when no copy remains.
This avoids distributed-lock ownership/expiry failures and the extra latency
and operational complexity of routing every issue through a queue. A queue
would serialize work but unnecessarily delay the synchronous circulation
decision.

## e) Semester-week 10× spike

Scale API instances and queue workers horizontally from CPU, request latency,
and queue depth; set autoscaling limits and warm capacity before semester
starts. CDN delivery removes static traffic, Redis absorbs repeated searches,
and MongoDB shards/replicas can be scaled independently using load metrics.
Apply per-campus rate limits, request timeouts, and backpressure to protect the
database; prioritize issue/return traffic over non-critical background work.
Use load tests and gradual capacity increases ahead of term start, then scale
back down afterward. This on-demand, independently scalable capacity avoids
paying for peak infrastructure all year while keeping the database as the
source of truth during bursts.
