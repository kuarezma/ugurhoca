import fs from 'node:fs';
import path from 'node:path';

const migrationDirectory = path.join(process.cwd(), 'supabase/migrations');
const migrationName = '20261004130000_single_admin_email.sql';
const retiredEmail = 'admin@matematiklab.com';
const normalizeSql = (sql: string) => sql.replace(/\s+/g, ' ').trim();
const withoutRetiredEmail = (sql: string) =>
  sql.replace(/,\s*'admin@matematiklab\.com'/g, '');

// Track DDL in filename order, including table deletion and the catalog-based
// initplan rewrite. This is a source regression check, not a PostgreSQL runner.
function effectiveDefinitions(files: string[]) {
  const policies = new Map<string, string>();
  const functions = new Map<string, string>();

  for (const file of files) {
    const sql = fs
      .readFileSync(path.join(migrationDirectory, file), 'utf8')
      .replace(/--[^\n]*/g, '');
    const statements = sql.matchAll(
      /CREATE POLICY[\s\S]*?;|DROP POLICY[\s\S]*?;|DROP TABLE[\s\S]*?;|CREATE OR REPLACE FUNCTION[\s\S]*?\$\$[\s\S]*?\$\$[^;]*;|ALTER FUNCTION[^;]*;/gi,
    );

    for (const [statement] of statements) {
      const policy = statement.match(
        /^(CREATE|DROP) POLICY\s+(?:IF EXISTS\s+)?"([^"]+)"\s+ON\s+public\.(\w+)/i,
      );
      if (policy) {
        const key = `${policy[3]}.${policy[2]}`;
        if (policy[1].toUpperCase() === 'DROP') policies.delete(key);
        else policies.set(key, normalizeSql(statement));
      }

      const droppedTable = statement.match(
        /^DROP TABLE\s+(?:IF EXISTS\s+)?public\.(\w+)/i,
      );
      if (droppedTable) {
        for (const key of policies.keys()) {
          if (key.startsWith(`${droppedTable[1]}.`)) policies.delete(key);
        }
      }

      const createdFunction = statement.match(
        /^CREATE OR REPLACE FUNCTION\s+public\.(\w+)\(/i,
      );
      if (createdFunction) {
        functions.set(createdFunction[1], normalizeSql(statement));
      }
      const securityMode = statement.match(
        /^ALTER FUNCTION\s+public\.(\w+)\(\)\s+SECURITY (INVOKER|DEFINER)/i,
      );
      if (securityMode) {
        const definition = functions.get(securityMode[1]);
        if (!definition)
          throw new Error(`Missing function: ${securityMode[1]}`);
        functions.set(
          securityMode[1],
          definition.replace(
            /SECURITY (INVOKER|DEFINER)/i,
            `SECURITY ${securityMode[2]}`,
          ),
        );
      }
    }

    if (file === '20260930140000_rls_initplan_and_fk_indexes.sql') {
      // Guard the source of this transformation so a changed catalog rewrite
      // cannot silently invalidate the effective-policy model below.
      expect(sql).toContain(
        "pat constant text := '(?<!select )auth\\.(uid|jwt|role)\\(\\)'",
      );
      expect(sql).toContain("'(select auth.\\1())', 'gi'");
      for (const [key, definition] of policies) {
        policies.set(
          key,
          definition.replace(
            /(?<!select )auth\.(uid|jwt|role)\(\)/gi,
            '(select auth.$1())',
          ),
        );
      }
    }
  }

  return { policies, functions };
}

describe('single admin migration', () => {
  const files = fs
    .readdirSync(migrationDirectory)
    .filter((file) => file.endsWith('.sql'))
    .sort();
  const before = effectiveDefinitions(
    files.filter((file) => file < migrationName),
  );
  // Equality is checked against this migration's own effect; later files
  // (e.g. 20261004130500, rebuilt from the production catalog) may redefine
  // the same policies in a different but equivalent form.
  const after = effectiveDefinitions(
    files.filter((file) => file <= migrationName),
  );
  const latest = effectiveDefinitions(files);
  const replacement = effectiveDefinitions([migrationName]);
  const sql = fs.readFileSync(
    path.join(migrationDirectory, migrationName),
    'utf8',
  );

  it('replaces every remaining retired-admin policy, excluding deleted tables', () => {
    const affected = [...before.policies].filter(([, definition]) =>
      definition.includes(retiredEmail),
    );
    expect(affected).toHaveLength(7);
    expect([...replacement.policies.keys()].sort()).toEqual(
      affected.map(([key]) => key).sort(),
    );
    expect(before.policies.has('chat_users.chat_users_admin_all')).toBe(false);

    for (const [key, definition] of affected) {
      expect(replacement.policies.get(key)).toBe(
        withoutRetiredEmail(definition),
      );
      const [table, name] = key.split('.');
      expect(sql).toContain(
        `DROP POLICY IF EXISTS "${name}" ON public.${table};`,
      );
    }
    for (const [key, definition] of before.policies) {
      expect(after.policies.get(key)).toBe(withoutRetiredEmail(definition));
    }
  });

  it('leaves no retired admin in the latest effective policies or function bodies', () => {
    expect(
      [
        ...after.policies.values(),
        ...after.functions.values(),
        ...latest.policies.values(),
        ...latest.functions.values(),
      ].join('\n'),
    ).not.toContain(retiredEmail);
  });

  it.each(['is_admin_email', 'get_admin_profile_id'])(
    'preserves the effective signature, security and body of %s except the email',
    (name) => {
      const previous = before.functions.get(name);
      expect(previous).toBeDefined();
      expect(previous).toContain(retiredEmail);
      expect(replacement.functions.get(name)).toBe(
        withoutRetiredEmail(previous!),
      );
      expect(after.functions.get(name)).toBe(replacement.functions.get(name));
      expect(latest.functions.get(name)).not.toContain(retiredEmail);
      expect(normalizeSql(sql)).toContain(
        `REVOKE ALL ON FUNCTION public.${name}() FROM PUBLIC, anon;`,
      );
      expect(normalizeSql(sql)).toContain(
        `GRANT EXECUTE ON FUNCTION public.${name}() TO authenticated, service_role;`,
      );
    },
  );

  it('uses bounded locks and only replaces definitions without modifying data', () => {
    const statements = sql.replace(/--[^\n]*/g, '').trim();
    expect(statements.startsWith("SET lock_timeout = '5s';")).toBe(true);
    expect(statements).not.toMatch(
      /\b(?:INSERT INTO|UPDATE public\.|DELETE FROM|TRUNCATE|ALTER TABLE|DROP TABLE)\b/i,
    );
    expect(sql).not.toContain(retiredEmail);
  });
});
