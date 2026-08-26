"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ChevronDown, CreditCard, Loader2, Repeat, Wallet, Zap } from "lucide-react";
import { api } from "@/src/services/api";
import { useCategories } from "@/src/hooks/useCategories";
import { CategoryIcon } from "../CategoryIcon/Index";
import { digitsToNumber, formatDigits, numberToDigits, toDigits } from "@/src/lib/money";
import { inputDateToISO, isoToInputDate, todayInput, yesterdayInput } from "@/src/lib/dates";
import { categoryForTitle, getSuggestions, rememberEntry, type RecentEntry } from "@/src/lib/recentEntries";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { themeFor } from "@/src/lib/transactionTheme";
import type {
  Transaction,
  TransactionFormState,
  TransactionKind,
  TransactionPayload,
  TransactionType,
} from "@/src/models/TransactionModel";

type TransactionFormProps = {
  type: TransactionKind;
  initialData?: Transaction | null;
  /** Vincula o lançamento a uma meta (usado no modal de detalhes da meta). */
  goalId?: string;
  /** Recebe o que acabou de ser gravado, para quem precisa reagir à data. */
  onSaved: (saved: { title: string; date: string }) => void;
  onCancel?: () => void;
  /** Fecha o modal depois de salvar; false mantém aberto para o próximo lançamento. */
  onDone?: () => void;
};

function emptyForm(): TransactionFormState {
  return {
    title: "",
    description: "",
    amountDigits: "",
    // Data já preenchida com hoje: era o campo que mais custava cliques.
    date: todayInput(),
    category: "",
    recurring: false,
    installments: "1",
  };
}

type RepetitionKey = "single" | "installments" | "recurring";

const REPETITIONS: { key: RepetitionKey; label: string; icon: typeof Wallet }[] = [
  { key: "single", label: "À vista", icon: Wallet },
  { key: "installments", label: "Parcelado", icon: CreditCard },
  { key: "recurring", label: "Recorrente", icon: Repeat },
];

/** "jun/2026" — cabe na prévia sem quebrar linha. */
function shortMonth(index: number): string {
  const label = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(
    new Date(Math.floor(index / 12), index % 12, 15),
  );

  return label.replace(/\.? de /, "/");
}

/** Estado inicial a partir da transação em edição, ou um formulário limpo. */
function formFrom(initialData?: Transaction | null): TransactionFormState {
  if (!initialData) return emptyForm();

  return {
    title: initialData.title ?? "",
    description: initialData.description ?? "",
    amountDigits: numberToDigits(initialData.amount),
    date: isoToInputDate(initialData.date),
    category: initialData.category ?? "",
    recurring: initialData.isRecurring ?? false,
    installments: String(initialData.installments ?? 1),
  };
}

export function TransactionForm({
  type,
  initialData,
  goalId,
  onSaved,
  onCancel,
  onDone,
}: TransactionFormProps) {
  const isEditing = Boolean(initialData?.id);
  const isGroup = Boolean(initialData?.groupId);
  const theme = themeFor(type);

  const { categories } = useCategories(type);

  // O modal remonta este formulário a cada abertura (via `key`), então o estado
  // inicial já vem certo — sem precisar de efeito para sincronizar com as props.
  const [form, setForm] = useState<TransactionFormState>(() => formFrom(initialData));
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(
    () => Boolean(initialData?.description) || Boolean(initialData?.isRecurring),
  );
  const [suggestions, setSuggestions] = useState<RecentEntry[]>(() =>
    initialData?.id ? [] : getSuggestions(type),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Ao editar uma parcela: alterar só ela ou o parcelamento inteiro.
  const [updateAll, setUpdateAll] = useState(false);

  /*
   * Estado próprio, e não derivado de form.installments: enquanto o usuário
   * apaga o campo para digitar "12", ele passa por "" e por "1". Derivar dali
   * fazia a seção inteira colapsar para "À vista" no meio da digitação.
   */
  const [repetition, setRepetition] = useState<RepetitionKey>(() =>
    initialData?.isRecurring
      ? "recurring"
      : Number(initialData?.installments ?? 1) > 1
        ? "installments"
        : "single",
  );

  const amountRef = useRef<HTMLInputElement>(null);
  // Se o usuário escolheu a categoria na mão, não sobrescrevemos com a sugestão.
  const categoryTouched = useRef(Boolean(initialData));
  const keepOpenRef = useRef(false);

  const placeholders = useMemo(
    () => ({
      income: { title: "Ex: Salário", description: "Origem da receita (opcional)" },
      expense: { title: "Ex: Aluguel", description: "Detalhes da despesa (opcional)" },
      investment: { title: "Ex: Aporte Tesouro Selic", description: "Detalhes do aporte (opcional)" },
    })[type],
    [type],
  );

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const update = <K extends keyof TransactionFormState>(key: K, value: TransactionFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key as string] ? { ...prev, [key as string]: "" } : prev));
  };

  const applySuggestion = (entry: RecentEntry) => {
    setForm((prev) => ({
      ...prev,
      title: entry.title,
      amountDigits: numberToDigits(entry.amount),
      category: entry.category,
    }));
    categoryTouched.current = true;
    setErrors({});
    amountRef.current?.focus();
  };

  /** Ao sair do campo nome, sugere a categoria usada da última vez para ele. */
  const handleTitleBlur = () => {
    if (categoryTouched.current || !form.title.trim()) return;

    const remembered = categoryForTitle(form.title, type);
    if (remembered) update("category", remembered);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const amount = digitsToNumber(form.amountDigits);
    const installments = Number(form.installments);

    if (!form.title.trim()) next.title = "Informe um nome";
    if (amount <= 0) next.amountDigits = "Informe um valor maior que zero";
    if (!form.date) next.date = "Informe a data";
    // Sem categoria padrão: escolher errado em silêncio é pior que um passo a mais.
    if (!form.category) next.category = "Escolha uma categoria";
    if (
      repetition === "installments" &&
      (!Number.isInteger(installments) || installments < 2 || installments > 48)
    )
      next.installments = "Entre 2 e 48 parcelas";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      toast.dismiss();
      toast.error("Confira os campos destacados");
      return;
    }

    setLoading(true);

    const amount = digitsToNumber(form.amountDigits);

    const payload: TransactionPayload = {
      title: form.title.trim(),
      amount,
      description: form.description.trim() || undefined,
      date: inputDateToISO(form.date),
      category: form.category,
      type: type.toUpperCase() as TransactionType,
      isRecurring: repetition === "recurring",
      installments: repetition === "installments" ? Number(form.installments) : 1,
      ...(goalId ? { goalId } : {}),
    };

    try {
      if (initialData?.id) {
        const scope = isGroup && updateAll ? "?updateAll=true" : "";
        await api.patch(`/transactions/${initialData.id}${scope}`, payload);
        toast.success(
          isGroup && updateAll ? "Todas as parcelas foram atualizadas!" : "Lançamento atualizado!",
        );
      } else {
        await api.post("/transactions", payload);
        toast.success(
          payload.installments > 1
            ? `${payload.installments} parcelas criadas!`
            : `${theme.label} salva com sucesso!`,
        );
      }

      rememberEntry({ title: payload.title, amount, category: payload.category, type });
      onSaved({ title: payload.title, date: form.date });

      if (keepOpenRef.current) {
        // "Salvar e novo": mantém data e categoria, limpa o resto.
        setForm((prev) => ({ ...emptyForm(), date: prev.date, category: prev.category }));
        setRepetition("single");
        setSuggestions(getSuggestions(type));
        amountRef.current?.focus();
      } else {
        onDone?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      keepOpenRef.current = false;
      setLoading(false);
    }
  };

  const amountPreview = digitsToNumber(form.amountDigits);

  const handleRepetitionChange = (key: RepetitionKey) => {
    setRepetition(key);
    // Ao escolher "Parcelado", uma parcela só não faria sentido.
    if (key === "installments" && Number(form.installments) < 2) {
      update("installments", "2");
    }
    setErrors((prev) => ({ ...prev, installments: "" }));
  };

  /** Em que meses as parcelas caem, e qual delas é a deste mês. */
  const installmentPlan = useMemo(() => {
    const count = Number(form.installments);

    if (repetition !== "installments" || !Number.isInteger(count) || count < 2 || !form.date) {
      return null;
    }

    const start = new Date(`${form.date}T12:00:00`);
    if (Number.isNaN(start.getTime())) return null;

    const firstIndex = start.getFullYear() * 12 + start.getMonth();
    const lastIndex = firstIndex + count - 1;

    const now = new Date();
    const nowIndex = now.getFullYear() * 12 + now.getMonth();
    const isWithin = nowIndex >= firstIndex && nowIndex <= lastIndex;

    return {
      each: amountPreview / count,
      firstLabel: shortMonth(firstIndex),
      lastLabel: shortMonth(lastIndex),
      currentNumber: isWithin ? nowIndex - firstIndex + 1 : null,
    };
  }, [repetition, form.installments, form.date, amountPreview]);

  /** Modo edição: mostra a repetição gravada, sem deixar alterá-la. */
  const repetitionSummary = initialData?.isRecurring
    ? "Recorrente (mensal)"
    : Number(initialData?.installments ?? 1) > 1
      ? initialData?.installmentNumber
        ? `Parcela ${initialData.installmentNumber} de ${initialData.installments}`
        : `Parcelado em ${initialData?.installments}x`
      : "Lançamento único";

  const dateShortcuts = [
    { label: "Hoje", value: todayInput() },
    { label: "Ontem", value: yesterdayInput() },
  ];

  return (
    // min-h-0 é o que faz o formulário rolar: um item de flex column tem
    // min-height:auto por padrão e se recusa a encolher abaixo do conteúdo,
    // então o overflow-y-auto de dentro nunca entrava em ação — o formulário
    // crescia, o modal cortava, e o rodapé com o botão Salvar saía da tela.
    // noValidate: a validação nativa do navegador bloqueia o submit com uma
    // mensagem em inglês e, se o campo estiver fora da área visível do modal,
    // não mostra nada — o formulário parece travado. Quem valida é o validate()
    // abaixo, que escreve o erro ao lado do campo.
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {/* Atalhos dos lançamentos mais frequentes */}
        {suggestions.length > 0 && (
          <section>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Zap size={13} />
              Lançamentos frequentes
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((entry) => (
                <button
                  key={`${entry.type}-${entry.title}`}
                  type="button"
                  onClick={() => applySuggestion(entry)}
                  className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  <span className="truncate max-w-[10rem]">{entry.title}</span>
                  <span className={`font-semibold ${theme.text}`}>{formatCurrency(entry.amount)}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Valor — o campo principal, grande e com foco automático */}
        <section>
          <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-slate-600">
            {repetition === "installments" ? "Valor total" : "Valor"}
          </label>
          <div
            className={`flex items-center gap-2 rounded-2xl border-2 bg-white px-4 py-3 transition ${
              errors.amountDigits
                ? "border-expense-500"
                : "border-slate-200 focus-within:border-brand-400"
            }`}
          >
            <span className="text-xl font-semibold text-slate-400">R$</span>
            <input
              id="amount"
              ref={amountRef}
              inputMode="decimal"
              autoComplete="off"
              value={formatDigits(form.amountDigits)}
              onChange={(e) => update("amountDigits", toDigits(e.target.value))}
              placeholder="0,00"
              className={`w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-slate-300 ${theme.text}`}
            />
          </div>
          {errors.amountDigits && <p className="mt-1 text-xs text-expense-600">{errors.amountDigits}</p>}
        </section>

        {/* Nome */}
        <section>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-600">
            Nome
          </label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            onBlur={handleTitleBlur}
            placeholder={placeholders.title}
            autoComplete="off"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 ${
              errors.title ? "border-expense-500" : "border-slate-200"
            }`}
          />
          {errors.title && <p className="mt-1 text-xs text-expense-600">{errors.title}</p>}
        </section>

        {/* Data com atalhos */}
        <section>
          <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-slate-600">
            Data
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {dateShortcuts.map((shortcut) => {
              const active = form.date === shortcut.value;
              return (
                <button
                  key={shortcut.label}
                  type="button"
                  onClick={() => update("date", shortcut.value)}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition cursor-pointer ${
                    active
                      ? "bg-navy-700 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {shortcut.label}
                </button>
              );
            })}
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className={`flex-1 min-w-[9rem] rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 cursor-pointer ${
                errors.date ? "border-expense-500" : "border-slate-200"
              }`}
            />
          </div>
          {errors.date && <p className="mt-1 text-xs text-expense-600">{errors.date}</p>}
        </section>

        {/* Categoria em chips com ícone */}
        <section>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = form.category === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    categoryTouched.current = true;
                    update("category", category.value);
                  }}
                  style={active ? { backgroundColor: category.color, borderColor: category.color } : undefined}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition cursor-pointer ${
                    active
                      ? "text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <CategoryIcon
                    icon={category.icon}
                    size={14}
                    style={!active ? { color: category.color } : undefined}
                  />
                  {category.label}
                </button>
              );
            })}
          </div>
          {errors.category && <p className="mt-1 text-xs text-expense-600">{errors.category}</p>}
        </section>

        {/* Repetição — parcelar é rotina aqui, não pode ficar escondido atrás
            de um "Mais opções" recolhido. */}
        {isEditing ? (
          <section>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Repetição</label>
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {repetitionSummary}
            </p>

            {isGroup && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { value: false, label: "Só este", hint: "Corrige uma parcela" },
                  { value: true, label: "Todas", hint: "Vale para o grupo" },
                ].map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => setUpdateAll(option.value)}
                    className={`rounded-xl border px-3 py-2 text-left transition cursor-pointer ${
                      updateAll === option.value
                        ? "border-navy-700 bg-navy-700 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-xs font-semibold">{option.label}</span>
                    <span
                      className={`block text-[11px] ${
                        updateAll === option.value ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      {option.hint}
                    </span>
                  </button>
                ))}

                <p className="col-span-2 text-[11px] text-slate-400">
                  A data sempre muda apenas neste lançamento — é ela que separa uma parcela da
                  outra.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Repetição</label>

            <div className="grid grid-cols-3 gap-2">
              {REPETITIONS.map((option) => {
                const active = repetition === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleRepetitionChange(option.key)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition cursor-pointer sm:text-sm ${
                      active
                        ? "border-navy-700 bg-navy-700 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <option.icon size={14} />
                    {option.label}
                  </button>
                );
              })}
            </div>

            {repetition === "installments" && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center gap-3">
                  <label htmlFor="installments" className="text-xs font-medium text-slate-500">
                    Nº de parcelas
                  </label>
                  <input
                    id="installments"
                    type="number"
                    inputMode="numeric"
                    min={2}
                    max={48}
                    value={form.installments}
                    onChange={(e) => update("installments", e.target.value)}
                    className={`w-20 rounded-lg border bg-white px-3 py-1.5 text-sm outline-none transition focus:border-brand-400 ${
                      errors.installments ? "border-expense-500" : "border-slate-200"
                    }`}
                  />
                </div>

                {errors.installments && (
                  <p className="mt-1.5 text-xs text-expense-600">{errors.installments}</p>
                )}

                {/* Deixa explícito o que será criado: quem lança uma compra
                    antiga precisa conferir em que mês cada parcela cai. */}
                {installmentPlan && (
                  <p className="mt-2 text-xs text-slate-500">
                    <strong className={theme.text}>
                      {form.installments}x de {formatCurrency(installmentPlan.each)}
                    </strong>{" "}
                    · de {installmentPlan.firstLabel} a {installmentPlan.lastLabel}
                    {installmentPlan.currentNumber && (
                      <span className="mt-0.5 block text-slate-400">
                        A parcela deste mês é a {installmentPlan.currentNumber}ª.
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {repetition === "recurring" && (
              <p className="mt-2 text-xs text-slate-500">
                Cria 12 lançamentos mensais a partir da data escolhida, com o mesmo valor.
              </p>
            )}
          </section>
        )}

        {/* Só a descrição continua recolhida */}
        <section className="rounded-xl border border-slate-200 bg-slate-50/60">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-600 cursor-pointer"
          >
            Descrição
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {showAdvanced && (
            <div className="border-t border-slate-200 px-4 py-4">
              <textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder={placeholders.description}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400"
              />
            </div>
          )}
        </section>
      </div>

      {/* Ações fixas no rodapé, sempre visíveis */}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white px-6 py-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer"
          >
            Cancelar
          </button>
        )}

        {!isEditing && (
          <button
            type="submit"
            disabled={loading}
            onClick={() => {
              keepOpenRef.current = true;
            }}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
          >
            Salvar e novo
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          onClick={() => {
            keepOpenRef.current = false;
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 cursor-pointer ${theme.solid} ${theme.solidHover}`}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {isEditing ? "Salvar alterações" : `Salvar ${theme.label.toLowerCase()}`}
        </button>
      </div>
    </form>
  );
}
