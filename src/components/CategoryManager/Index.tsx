"use client";

import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { CategoryPill } from "../CategoryPill/Index";
import { CategoryIcon } from "../CategoryIcon/Index";
import {
  addCategory,
  DEFAULT_CATEGORIES,
  findCategory,
  ICON_OPTIONS,
  removeCategory,
  restoreCategory,
  slugify,
  type Category,
  type CategoryKind,
} from "@/src/lib/categories";
import { useCategories } from "@/src/hooks/useCategories";
import { TYPE_THEME } from "@/src/lib/transactionTheme";

const KINDS: CategoryKind[] = ["expense", "income", "investment"];

const COLOR_OPTIONS = [
  "#6366f1", "#0ea5e9", "#14b8a6", "#10b981", "#84cc16",
  "#eab308", "#f97316", "#ef4444", "#f43f5e", "#ec4899",
  "#8b5cf6", "#94a3b8",
];

/**
 * Cadastro de categorias.
 *
 * As categorias eram literais dentro das páginas de Receitas e Despesas — mudar
 * uma exigia editar o código. Categorias padrão não são apagadas, apenas
 * ocultadas, para que lançamentos antigos continuem exibindo o rótulo certo.
 */
export function CategoryManager() {
  const { categories, hidden } = useCategories();
  const [kind, setKind] = useState<CategoryKind>("expense");

  const [label, setLabel] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);

  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      toast.error("Dê um nome à categoria");
      return;
    }

    const value = slugify(trimmed);
    if (!value) {
      toast.error("Nome inválido");
      return;
    }

    // Um valor repetido faria duas categorias disputarem os mesmos lançamentos.
    const exists = [...DEFAULT_CATEGORIES, ...categories].some((c) => c.value === value);
    if (exists) {
      toast.error("Já existe uma categoria com esse nome");
      return;
    }

    addCategory({ value, label: trimmed, color, icon, kind });
    setLabel("");
    toast.success("Categoria criada!");
  };

  const handleRemove = (category: Category) => {
    removeCategory(category.value);
    toast.success(category.custom ? "Categoria excluída" : "Categoria ocultada");
  };

  const visible = categories.filter((category) => category.kind === kind);
  const hiddenOfKind = hidden.filter((value) => findCategory(value).kind === kind);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-navy-800">Categorias</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Organize seus lançamentos do jeito que faz sentido para você.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {KINDS.map((option) => {
          const theme = TYPE_THEME[option];
          const active = kind === option;

          return (
            <button
              key={option}
              onClick={() => setKind(option)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer sm:text-sm ${
                active ? `bg-white shadow-sm ${theme.text}` : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {theme.plural}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 space-y-1.5">
        {visible.map((category) => (
            <li
              key={category.value}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${category.color}1a`, color: category.color }}
                >
                  <CategoryIcon icon={category.icon} size={15} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-800">{category.label}</p>
                  <p className="text-[11px] text-slate-400">
                    {category.custom ? "Criada por você" : "Padrão"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleRemove(category)}
                title={category.custom ? "Excluir categoria" : "Ocultar categoria"}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-expense-50 hover:text-expense-600 cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </li>
        ))}
      </ul>

      {hiddenOfKind.length > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ocultas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {hiddenOfKind.map((value) => (
              <button
                key={value}
                onClick={() => restoreCategory(value)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-500 transition hover:text-slate-700 cursor-pointer"
              >
                <RotateCcw size={12} />
                {findCategory(value).label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nova categoria */}
      <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Nova categoria de {TYPE_THEME[kind].plural.toLowerCase()}
        </p>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Ex: Pets"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400"
          />

          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 cursor-pointer"
          >
            <Plus size={15} />
            Adicionar
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Cor</span>
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setColor(option)}
                aria-label={`Cor ${option}`}
                style={{ backgroundColor: option }}
                className={`h-5 w-5 rounded-full transition cursor-pointer ${
                  color === option ? "ring-2 ring-navy-700 ring-offset-2" : ""
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Ícone</span>
            {ICON_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setIcon(option)}
                  aria-label={`Ícone ${option}`}
                  className={`rounded-lg p-1.5 transition cursor-pointer ${
                    icon === option ? "bg-navy-700 text-white" : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <CategoryIcon icon={option} size={14} />
                </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Prévia</span>
          <CategoryPill
            category={{ value: "preview", label: label.trim() || "Nova categoria", color, icon, kind }}
            size="md"
          />
        </div>
      </div>
    </section>
  );
}
