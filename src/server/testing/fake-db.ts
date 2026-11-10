// Banco em memória para testes de rota (sem MongoDB). Implementa só o subconjunto
// do Prisma usado pelos serviços e respeita filtros `where`, para que os testes de
// autorização falhem de verdade se uma query esquecer o `userId`.
import type { PrismaClient } from "@prisma/client";

export type Row = Record<string, unknown>;
type Where = Record<string, unknown>;
type OrderBy = Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];

const OPERATORS = new Set(["in", "gte", "lte", "gt", "lt", "not", "equals", "isSet"]);

function isPlain(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

function matchOperators(actual: unknown, ops: Record<string, unknown>): boolean {
  return Object.entries(ops).every(([op, expected]) => {
    switch (op) {
      case "in":
        return Array.isArray(expected) && expected.includes(actual);
      case "gte":
        return (actual as string | number) >= (expected as string | number);
      case "lte":
        return (actual as string | number) <= (expected as string | number);
      case "gt":
        return (actual as string | number) > (expected as string | number);
      case "lt":
        return (actual as string | number) < (expected as string | number);
      case "not":
        return actual !== expected;
      default:
        return actual === expected;
    }
  });
}

// Como no Prisma + MongoDB: `{ campo: null }` só casa com campo gravado como null; documento sem o
// campo exige `{ campo: { isSet: false } }`. Esconder essa diferença já escondeu um bug real.
function matches(row: Row, where: Where = {}): boolean {
  return Object.entries(where).every(([key, expected]) => {
    if (expected === undefined) return true;
    if (key === "OR") return (expected as Where[]).some((w) => matches(row, w));
    if (isPlain(expected)) {
      const isOperatorBag = Object.keys(expected).every((k) => OPERATORS.has(k));
      if (isOperatorBag) {
        if ("isSet" in expected) return (key in row && row[key] !== undefined) === expected.isSet;
        return matchOperators(row[key] ?? null, expected);
      }
      return matches(row, expected); // chave única composta: habitId_date
    }
    if (expected === null) return key in row && row[key] === null;
    return row[key] === expected;
  });
}

function sortRows(rows: Row[], orderBy?: OrderBy): Row[] {
  const rules = (Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : []).flatMap((o) => Object.entries(o));
  return [...rows].sort((a, b) => {
    for (const [field, dir] of rules) {
      const x = a[field] as number | string;
      const y = b[field] as number | string;
      if (x === y) continue;
      return (x < y ? -1 : 1) * (dir === "asc" ? 1 : -1);
    }
    return 0;
  });
}

let counter = 0;
function objectId(): string {
  counter += 1;
  return counter.toString(16).padStart(24, "0");
}

type ModelOptions = { defaults?: () => Row; unique?: string[][] };

class FakeModel {
  rows: Row[] = [];
  constructor(private readonly options: ModelOptions = {}) {}

  private insert(data: Row): Row {
    const row: Row = {
      id: objectId(),
      ...this.options.defaults?.(),
      ...data,
    };
    row.updatedAt = data.updatedAt ?? new Date();
    for (const fields of this.options.unique ?? []) {
      if (this.rows.some((r) => fields.every((f) => r[f] === row[f]))) {
        throw new Error(`Unique constraint failed on ${fields.join(",")}`);
      }
    }
    this.rows.push(row);
    return { ...row };
  }

  async create({ data }: { data: Row }) {
    return this.insert(data);
  }
  async findMany({ where, orderBy }: { where?: Where; orderBy?: OrderBy } = {}) {
    return sortRows(
      this.rows.filter((r) => matches(r, where)),
      orderBy,
    ).map((r) => ({ ...r }));
  }
  async findFirst({ where, orderBy }: { where?: Where; orderBy?: OrderBy } = {}) {
    return (await this.findMany({ where, orderBy }))[0] ?? null;
  }
  async findUnique({ where }: { where: Where }) {
    return this.findFirst({ where });
  }
  async count({ where }: { where?: Where } = {}) {
    return this.rows.filter((r) => matches(r, where)).length;
  }
  async update({ where, data }: { where: Where; data: Row }) {
    const row = this.rows.find((r) => matches(r, where));
    if (!row) throw new Error("Record to update not found");
    Object.assign(row, data, { updatedAt: new Date() });
    return { ...row };
  }
  async updateMany({ where, data }: { where?: Where; data: Row }) {
    const hit = this.rows.filter((r) => matches(r, where));
    for (const row of hit) Object.assign(row, data, { updatedAt: new Date() });
    return { count: hit.length };
  }
  async upsert({ where, create, update }: { where: Where; create: Row; update: Row }) {
    const row = this.rows.find((r) => matches(r, where));
    if (row) return this.update({ where, data: update });
    return this.insert(create);
  }
  async deleteMany({ where }: { where?: Where } = {}) {
    const before = this.rows.length;
    this.rows = this.rows.filter((r) => !matches(r, where));
    return { count: before - this.rows.length };
  }
  async delete({ where }: { where: Where }) {
    const row = this.rows.find((r) => matches(r, where));
    if (!row) throw new Error("Record to delete not found");
    this.rows = this.rows.filter((r) => r !== row);
    return { ...row };
  }
}

export type FakeDb = {
  profile: FakeModel;
  category: FakeModel;
  habitTemplate: FakeModel;
  habit: FakeModel;
  habitLog: FakeModel;
  pushToken: FakeModel;
  user: FakeModel;
  session: FakeModel;
  account: FakeModel;
  $reset(): void;
  $transaction<T>(fn: (tx: FakeDb) => Promise<T>): Promise<T>;
};

export function createFakeDb(): FakeDb {
  const build = () => ({
    profile: new FakeModel({
      unique: [["userId"]],
      defaults: () => ({
        accent: "#b9d94c",
        themeMode: "SYSTEM",
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
        onboardingDone: false,
        createdAt: new Date(),
      }),
    }),
    category: new FakeModel({ unique: [["slug"]] }),
    habitTemplate: new FakeModel({ unique: [["slug"]] }),
    habit: new FakeModel({
      defaults: () => ({
        templateId: null,
        reminders: [],
        quickActions: true,
        order: 0,
        // Sem `archivedAt`: o Prisma não grava opcionais omitidos, e o Mongo distingue ausente de null.
        createdAt: new Date(),
      }),
    }),
    habitLog: new FakeModel({
      unique: [["habitId", "date"]],
      defaults: () => ({
        value: 0,
        status: "PENDING",
        source: "APP",
        completedAt: null,
        clientId: null,
        appliedClientIds: [],
      }),
    }),
    pushToken: new FakeModel({ unique: [["token"]] }),
    user: new FakeModel({ unique: [["email"]] }),
    session: new FakeModel(),
    account: new FakeModel(),
  });
  const db = { ...build(), $reset() {}, $transaction: async () => undefined } as unknown as FakeDb;
  db.$reset = () => Object.assign(db, build());
  // Rollback simulado: restaura as linhas de todos os modelos se o callback lançar.
  db.$transaction = async (fn) => {
    const models = Object.values(db).filter((m): m is FakeModel => m instanceof FakeModel);
    const snapshot = models.map((m) => m.rows.map((r) => ({ ...r })));
    try {
      return await fn(db);
    } catch (error) {
      models.forEach((m, i) => {
        m.rows = snapshot[i] ?? [];
      });
      throw error;
    }
  };
  return db;
}

export function asPrisma(db: FakeDb): PrismaClient {
  return db as unknown as PrismaClient;
}
