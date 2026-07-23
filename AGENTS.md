# Database types

Derive database types from the Drizzle schema — never hand-write custom or partial shapes for table rows. Export `typeof table.$inferSelect` (and `$inferInsert` when needed) from `src/db/schema.ts` and import it. When a consumer needs only some columns, narrow with `Pick<Row, ...>` / `Omit<Row, ...>` rather than redeclaring a literal type. Don't add an insert type where `db.insert(...).values()` already enforces the shape.

# Adding a workflow node

Three edits, all under `features/workflows/nodes/`:

1. the impl file (e.g. `open-url.ts`) — the node's executor logic,
2. register it in `node-executors.ts` — the `satisfies` contract makes a missing
   executor a compile error for action nodes,
3. add its manifest entry in `node-registry.ts` — kind, label, icon, accent, its
   input `fields`, and the `outputs` downstream nodes can reference.

The run task and the canvas step node are registry-driven — never touch them to add
a node.
