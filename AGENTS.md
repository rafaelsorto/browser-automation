# Database types

Derive database types from the Drizzle schema — never hand-write custom or partial shapes for table rows. Export `typeof table.$inferSelect` (and `$inferInsert` when needed) from `src/db/schema.ts` and import it. When a consumer needs only some columns, narrow with `Pick<Row, ...>` / `Omit<Row, ...>` rather than redeclaring a literal type. Don't add an insert type where `db.insert(...).values()` already enforces the shape.
