# Secure Query Patterns - Quick Reference

**MARCUS Platform Security Guide**

This is a one-page quick reference for writing secure database queries in the MARCUS platform.

---

## TypeScript (PostgreSQL via `pg`)

### ✅ CORRECT - Parameterized Queries

```typescript
// Simple SELECT
const result = await db.query(
  'SELECT * FROM agent_states WHERE agent_id = $1',
  [agentId]
);

// INSERT with multiple parameters
await db.query(`
  INSERT INTO agent_states (agent_id, reputation, total_citations)
  VALUES ($1, $2, $3)
`, [agentId, reputation, totalCitations]);

// UPDATE
await db.query(
  'UPDATE agent_states SET reputation = $1 WHERE agent_id = $2',
  [newReputation, agentId]
);

// UPSERT (INSERT ... ON CONFLICT)
await db.query(`
  INSERT INTO agent_states (agent_id, reputation)
  VALUES ($1, $2)
  ON CONFLICT (agent_id) DO UPDATE
  SET reputation = EXCLUDED.reputation
`, [agentId, reputation]);

// IN clause (array parameter)
await db.query(
  'SELECT * FROM agent_states WHERE agent_id = ANY($1)',
  [[agent1, agent2, agent3]]
);

// JSONB parameter
await db.query(
  'INSERT INTO agent_states (agent_id, memory_state) VALUES ($1, $2)',
  [agentId, JSON.stringify(memoryObject)]
);
```

### ❌ WRONG - String Concatenation

```typescript
// ❌ VULNERABLE - Never do this!
const query = `SELECT * FROM agent_states WHERE agent_id = '${agentId}'`;

// ❌ VULNERABLE - Template literals
const query = `SELECT * FROM agent_states WHERE reputation > ${minReputation}`;

// ❌ VULNERABLE - String concatenation
const query = 'SELECT * FROM agent_states WHERE agent_id = \'' + agentId + '\'';

// ❌ VULNERABLE - Building WHERE clause from user input
const whereClause = req.query.filter; // User-controlled
const query = `SELECT * FROM agent_states WHERE ${whereClause}`;
```

---

## Python (PostgreSQL via `psycopg2`)

### ✅ CORRECT - Parameterized Queries

```python
# Named parameters (recommended for clarity)
cursor.execute("""
    SELECT * FROM agent_states
    WHERE agent_id = %(agent_id)s
""", {'agent_id': agent_id})

# Positional parameters
cursor.execute(
    "SELECT * FROM agent_states WHERE agent_id = %s",
    (agent_id,)  # Note: tuple, even for single parameter!
)

# INSERT with multiple parameters
cursor.execute("""
    INSERT INTO agent_states (agent_id, reputation, total_citations)
    VALUES (%(agent_id)s, %(reputation)s, %(total_citations)s)
""", {
    'agent_id': agent_id,
    'reputation': reputation,
    'total_citations': total_citations
})

# UPDATE
cursor.execute(
    "UPDATE agent_states SET reputation = %s WHERE agent_id = %s",
    (new_reputation, agent_id)
)

# UPSERT
cursor.execute("""
    INSERT INTO agent_states (agent_id, reputation)
    VALUES (%(agent_id)s, %(reputation)s)
    ON CONFLICT (agent_id) DO UPDATE
    SET reputation = EXCLUDED.reputation
""", {'agent_id': agent_id, 'reputation': reputation})

# IN clause (use tuple)
cursor.execute(
    "SELECT * FROM agent_states WHERE agent_id IN %s",
    ((agent1, agent2, agent3),)  # Note: tuple of tuple!
)

# JSONB parameter
import json
cursor.execute(
    "INSERT INTO agent_states (agent_id, memory_state) VALUES (%s, %s)",
    (agent_id, json.dumps(memory_dict))
)
```

### ❌ WRONG - String Formatting

```python
# ❌ VULNERABLE - f-strings
query = f"SELECT * FROM agent_states WHERE agent_id = '{agent_id}'"

# ❌ VULNERABLE - % formatting
query = "SELECT * FROM agent_states WHERE agent_id = '%s'" % agent_id

# ❌ VULNERABLE - .format()
query = "SELECT * FROM agent_states WHERE agent_id = '{}'".format(agent_id)

# ❌ VULNERABLE - String concatenation
query = "SELECT * FROM agent_states WHERE agent_id = '" + agent_id + "'"

# ❌ VULNERABLE - Building SQL from user input
where_clause = request.args.get('filter')  # User-controlled
query = f"SELECT * FROM agent_states WHERE {where_clause}"
```

---

## Common Pitfalls

### Pitfall 1: Dynamic Column Names
```typescript
// ❌ VULNERABLE - User controls column name
const sortBy = req.query.sort; // Could be "id; DROP TABLE--"
await db.query(`SELECT * FROM agent_states ORDER BY ${sortBy}`);

// ✅ SAFE - Whitelist allowed columns
const ALLOWED_SORT_COLUMNS = ['agent_id', 'reputation', 'timestamp'];
const sortBy = ALLOWED_SORT_COLUMNS.includes(req.query.sort)
  ? req.query.sort
  : 'timestamp';
await db.query(`SELECT * FROM agent_states ORDER BY ${sortBy}`);
```

### Pitfall 2: Dynamic Table Names
```typescript
// ❌ VULNERABLE - User controls table name
const table = req.params.table;
await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);

// ✅ SAFE - Whitelist allowed tables
const ALLOWED_TABLES = ['agent_states', 'citation_analyses'];
if (!ALLOWED_TABLES.includes(req.params.table)) {
  throw new Error('Invalid table name');
}
const table = req.params.table;
await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
```

### Pitfall 3: Building Complex WHERE Clauses
```typescript
// ❌ VULNERABLE - Concatenating conditions
let where = 'WHERE 1=1';
if (minRep) where += ` AND reputation > ${minRep}`;
if (agentId) where += ` AND agent_id = '${agentId}'`;

// ✅ SAFE - Use arrays and parameters
const conditions: string[] = [];
const params: any[] = [];

if (minRep !== undefined) {
  conditions.push(`reputation > $${params.length + 1}`);
  params.push(minRep);
}
if (agentId !== undefined) {
  conditions.push(`agent_id = $${params.length + 1}`);
  params.push(agentId);
}

const where = conditions.length > 0
  ? 'WHERE ' + conditions.join(' AND ')
  : '';

await db.query(`SELECT * FROM agent_states ${where}`, params);
```

---

## Input Validation

Always validate before database calls:

```typescript
function validateAgentId(agentId: unknown): string {
  if (typeof agentId !== 'string') {
    throw new Error('Agent ID must be a string');
  }
  if (agentId.length === 0 || agentId.length > 50) {
    throw new Error('Agent ID must be 1-50 characters');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(agentId)) {
    throw new Error('Agent ID contains invalid characters');
  }
  return agentId;
}

// Usage
const agentId = validateAgentId(req.params.id);
await db.query('SELECT * FROM agent_states WHERE agent_id = $1', [agentId]);
```

---

## Testing for SQL Injection

Always test your queries with malicious inputs:

```typescript
test('handles SQL injection attempts', async () => {
  const maliciousInputs = [
    "'; DROP TABLE agent_states; --",
    "' OR '1'='1",
    "' UNION SELECT password FROM users--",
  ];

  for (const input of maliciousInputs) {
    // Should not throw, should not execute malicious SQL
    await expect(saveAgent(input)).resolves.not.toThrow();

    // Table should still exist
    const result = await db.query('SELECT COUNT(*) FROM agent_states');
    expect(result.rows[0].count).toBeGreaterThanOrEqual(0);
  }
});
```

---

## Red Flags in Code Review

Look for these patterns during code review:

- 🚨 Template literals with user input: `` `SELECT * FROM ${table}` ``
- 🚨 f-strings in Python: `f"SELECT * FROM {table}"`
- 🚨 String concatenation: `'SELECT * FROM ' + table`
- 🚨 `.format()` in Python: `"SELECT * FROM {}".format(table)`
- 🚨 Comments like "TODO: fix SQL injection"
- 🚨 Any SQL that doesn't use `$1/$2` or `%s/%(name)s`

---

## Safe Query Builders

For complex queries, consider using query builders:

```typescript
// TypeScript: Knex.js
const results = await knex('agent_states')
  .where('agent_id', agentId)
  .andWhere('reputation', '>', minReputation)
  .select('*');

// TypeScript: TypeORM
const results = await agentRepository.find({
  where: {
    agentId: agentId,
    reputation: MoreThan(minReputation)
  }
});
```

These libraries handle parameterization automatically.

---

## Resources

- **Full Documentation:** See `SQL_INJECTION_PREVENTION.md`
- **Test Suite:** `src/platform/tests/sqlInjectionTests.ts`
- **OWASP Guide:** https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html

---

**Remember:** When in doubt, parameterize. Never concatenate user input into SQL.
