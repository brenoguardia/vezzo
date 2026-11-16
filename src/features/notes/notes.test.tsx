import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { dayLabel } from "@/features/notes/dayLabel";
import { NoteComposer } from "@/features/notes/NoteComposer";
import { NoteTimeline } from "@/features/notes/NoteTimeline";
import { setLocale, t } from "@/i18n";
import type { NoteDto } from "@/shared/schemas";
import { newestFirst, useNotesStore } from "@/store/notes";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

const HABIT = "0000000000000000000000aa";
const note = (id: string, date: string, text: string, createdAt = `${date}T10:00:00.000Z`): NoteDto => ({
  id,
  habitId: HABIT,
  date,
  text,
  createdAt,
  updatedAt: createdAt,
});

beforeEach(() => {
  setLocale("pt-BR");
  useNotesStore.getState().clear();
});

describe("dayLabel", () => {
  it("usa Hoje e Ontem e o dia por extenso nos demais", () => {
    expect(dayLabel("2026-11-16", "2026-11-16", "pt-BR", t)).toBe("Hoje");
    expect(dayLabel("2026-11-15", "2026-11-16", "pt-BR", t)).toBe("Ontem");
    expect(dayLabel("2026-11-02", "2026-11-16", "pt-BR", t)).toBe("2 de novembro");
    expect(dayLabel("2025-12-24", "2026-11-16", "pt-BR", t)).toBe("24 de dezembro de 2025");
  });
});

describe("store de anotações", () => {
  it("mantém a ordem da timeline ao inserir e editar", () => {
    const { upsert, setFirstPage } = useNotesStore.getState();
    setFirstPage(HABIT, { notes: [note("2", "2026-11-10", "b"), note("1", "2026-11-01", "a")], nextCursor: null });
    upsert(note("3", "2026-11-05", "meio"));
    upsert(note("1", "2026-11-12", "a editada"));
    expect(useNotesStore.getState().byHabit[HABIT]?.notes.map((n) => n.id)).toEqual(["1", "2", "3"]);
  });

  it("no mesmo dia, a mais recente vem primeiro", () => {
    const early = note("1", "2026-11-10", "cedo", "2026-11-10T08:00:00.000Z");
    const late = note("2", "2026-11-10", "tarde", "2026-11-10T20:00:00.000Z");
    expect([early, late].sort(newestFirst).map((n) => n.id)).toEqual(["2", "1"]);
  });

  it("anexa a próxima página sem duplicar e remove", () => {
    const { setFirstPage, appendPage, remove } = useNotesStore.getState();
    setFirstPage(HABIT, { notes: [note("2", "2026-11-10", "b")], nextCursor: 1 });
    appendPage(HABIT, { notes: [note("2", "2026-11-10", "b"), note("1", "2026-11-01", "a")], nextCursor: null });
    expect(useNotesStore.getState().byHabit[HABIT]).toMatchObject({ nextCursor: null });
    expect(useNotesStore.getState().byHabit[HABIT]?.notes).toHaveLength(2);
    remove(HABIT, "2");
    expect(useNotesStore.getState().byHabit[HABIT]?.notes.map((n) => n.id)).toEqual(["1"]);
  });
});

describe("NoteTimeline", () => {
  const notes = [
    note("3", "2026-11-16", "hoje 2", "2026-11-16T20:00:00.000Z"),
    note("2", "2026-11-16", "hoje 1", "2026-11-16T08:00:00.000Z"),
    note("1", "2026-11-02", "dia 2"),
  ];

  it("agrupa por dia: um cabeçalho por dia e todas as anotações", async () => {
    await render(<NoteTimeline notes={notes} today="2026-11-16" />);
    expect(screen.getAllByRole("header")).toHaveLength(2);
    expect(screen.getByText("Hoje")).toBeTruthy();
    expect(screen.getByText("2 de novembro")).toBeTruthy();
    for (const text of ["hoje 2", "hoje 1", "dia 2"]) expect(screen.getByText(text)).toBeTruthy();
  });

  it("é só leitura sem ações", async () => {
    await render(<NoteTimeline notes={notes} today="2026-11-16" />);
    expect(screen.queryByText("Editar")).toBeNull();
    expect(screen.queryByText("Excluir")).toBeNull();
  });

  it("exclui só depois de confirmar", async () => {
    const onDelete = jest.fn(async (_n: NoteDto) => {});
    await render(<NoteTimeline notes={[notes[2] as NoteDto]} today="2026-11-16" onDelete={onDelete} />);
    await fireEvent.press(screen.getByText("Excluir"));
    expect(onDelete).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText("Confirmar exclusão"));
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
  });

  it("mostra erro quando a exclusão falha", async () => {
    const onDelete = jest.fn(async (_n: NoteDto) => {
      throw new Error("offline");
    });
    await render(<NoteTimeline notes={[notes[2] as NoteDto]} today="2026-11-16" onDelete={onDelete} />);
    await fireEvent.press(screen.getByText("Excluir"));
    await fireEvent.press(screen.getByText("Confirmar exclusão"));
    expect(await screen.findByText("Não foi possível excluir. Tente de novo.")).toBeTruthy();
  });
});

describe("NoteComposer", () => {
  it("só salva com texto e envia o dia escolhido", async () => {
    const onSubmit = jest.fn(async (_v: { date: string; text: string }) => {});
    await render(<NoteComposer today="2026-11-16" onSubmit={onSubmit} onCancel={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Salvar" }).props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(screen.getByRole("button", { name: "Dia anterior" }));
    await fireEvent.changeText(screen.getByLabelText("Anotação"), "  Foi difícil hoje  ");
    await fireEvent.press(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ date: "2026-11-15", text: "Foi difícil hoje" }));
  });

  it("não deixa escolher um dia futuro", async () => {
    await render(<NoteComposer today="2026-11-16" onSubmit={jest.fn(async () => {})} onCancel={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Próximo dia" }).props.accessibilityState?.disabled).toBe(true);
  });

  it("mantém o texto e avisa quando salvar falha", async () => {
    const onSubmit = jest.fn(async (_v: { date: string; text: string }) => {
      throw new Error("offline");
    });
    await render(<NoteComposer today="2026-11-16" onSubmit={onSubmit} onCancel={jest.fn()} />);
    await fireEvent.changeText(screen.getByLabelText("Anotação"), "não perder");
    await fireEvent.press(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Não foi possível salvar a anotação. Verifique a conexão.")).toBeTruthy();
    expect(screen.getByLabelText("Anotação").props.value).toBe("não perder");
  });
});
