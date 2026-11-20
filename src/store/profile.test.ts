import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ProfileDto } from "@/shared/schemas";
import { useProfileStore } from "./profile";

const mockApiFetch = jest.fn<(path: string, schema: unknown) => Promise<ProfileDto>>();
jest.mock("@/api/client", () => ({ apiFetch: (path: string, schema: unknown) => mockApiFetch(path, schema) }));
jest.mock("@/api/profile", () => ({ updateProfile: jest.fn() }));
jest.mock("@/lib/theme-sync", () => ({ applyPreferences: jest.fn() }));

const profile = (overrides: Partial<ProfileDto> = {}): ProfileDto => ({
  displayName: "Ana",
  accent: "#b8d94e",
  themeMode: "SYSTEM",
  language: "pt-BR",
  timezone: "America/Sao_Paulo",
  onboardingDone: true,
  createdAt: "2026-11-01T00:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  useProfileStore.setState({ profile: null, ownerId: null, status: "idle" });
});

describe("load", () => {
  it("sem cache: fica em loading, busca e guarda o dono", async () => {
    mockApiFetch.mockResolvedValue(profile());
    const pending = useProfileStore.getState().load("u1");
    expect(useProfileStore.getState().status).toBe("loading");
    await pending;
    expect(useProfileStore.getState()).toMatchObject({ status: "ready", ownerId: "u1" });
    expect(useProfileStore.getState().profile?.displayName).toBe("Ana");
  });

  it("sem cache e sem rede: status error", async () => {
    mockApiFetch.mockRejectedValue(new Error("offline"));
    await useProfileStore.getState().load("u1");
    expect(useProfileStore.getState().status).toBe("error");
  });

  it("com cache do mesmo usuário: não volta a loading e revalida em segundo plano", async () => {
    useProfileStore.setState({ profile: profile({ displayName: "Velho" }), ownerId: "u1", status: "idle" });
    mockApiFetch.mockResolvedValue(profile({ displayName: "Novo" }));
    const pending = useProfileStore.getState().load("u1");
    expect(useProfileStore.getState().status).not.toBe("loading");
    expect(useProfileStore.getState().profile?.displayName).toBe("Velho");
    await pending;
    expect(useProfileStore.getState().profile?.displayName).toBe("Novo");
  });

  it("com cache e sem rede: mantém o perfil guardado, sem erro", async () => {
    useProfileStore.setState({ profile: profile(), ownerId: "u1", status: "idle" });
    mockApiFetch.mockRejectedValue(new Error("offline"));
    await useProfileStore.getState().load("u1");
    expect(useProfileStore.getState().status).not.toBe("error");
    expect(useProfileStore.getState().profile).not.toBeNull();
  });

  it("cache de outro usuário: descarta antes de buscar", async () => {
    useProfileStore.setState({ profile: profile({ displayName: "Outra" }), ownerId: "u1", status: "ready" });
    mockApiFetch.mockResolvedValue(profile({ displayName: "Bia" }));
    const pending = useProfileStore.getState().load("u2");
    expect(useProfileStore.getState().profile).toBeNull();
    expect(useProfileStore.getState().status).toBe("loading");
    await pending;
    expect(useProfileStore.getState()).toMatchObject({ ownerId: "u2", status: "ready" });
  });
});

describe("clear", () => {
  it("apaga perfil e dono", () => {
    useProfileStore.setState({ profile: profile(), ownerId: "u1", status: "ready" });
    useProfileStore.getState().clear();
    expect(useProfileStore.getState()).toMatchObject({ profile: null, ownerId: null, status: "idle" });
  });
});
