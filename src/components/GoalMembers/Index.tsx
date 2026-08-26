"use client";

import { useMemo, useState } from "react";
import { Crown, UserMinus, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/src/services/api";
import { ConfirmDialog } from "../ConfirmDialog/Index";
import { formatCurrency } from "@/src/utils/formatCurrency";
import type { GoalMember } from "@/src/models/GoalModel";
import type { Transaction } from "@/src/models/TransactionModel";

type GoalMembersProps = {
  goalId: string;
  members: GoalMember[];
  contributions: Transaction[];
  isOwner: boolean;
  onChanged: () => void;
};

export function GoalMembers({
  goalId,
  members,
  contributions,
  isOwner,
  onChanged,
}: GoalMembersProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [toRemove, setToRemove] = useState<GoalMember | null>(null);

  /**
   * Quanto cada pessoa aportou.
   *
   * Numa meta a dois essa é das primeiras perguntas, e o dado sempre esteve nos
   * lançamentos — só não era somado em lugar nenhum.
   */
  const byMember = useMemo(() => {
    const totals = new Map<string, number>();
    let overall = 0;

    for (const item of contributions) {
      const key = item.userName ?? "";
      totals.set(key, (totals.get(key) ?? 0) + Number(item.amount));
      overall += Number(item.amount);
    }

    return { totals, overall };
  }, [contributions]);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim()) return;

    setSaving(true);
    try {
      await api.post(`/goals/${goalId}/members`, { username: username.trim().toLowerCase() });
      toast.success("Participante adicionado!");
      setUsername("");
      setIsAdding(false);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao adicionar participante");
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = async () => {
    if (!toRemove) return;

    try {
      await api.delete(`/goals/${goalId}/members/${toRemove.id}`);
      toast.success("Participante removido");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover participante");
    } finally {
      setToRemove(null);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-navy-800">
          {members.length > 1 ? "Quem aportou" : "Participantes"}
        </h3>

        {isOwner && (
          <button
            onClick={() => setIsAdding((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer"
          >
            <UserPlus size={14} />
            Adicionar
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mt-3 flex gap-2">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value.replace(/\s/g, "").toLowerCase())}
            placeholder="usuário"
            autoFocus
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-400"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-navy-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60 cursor-pointer"
          >
            {saving ? "..." : "Convidar"}
          </button>
        </form>
      )}

      <ul className="mt-4 space-y-2">
        {members.map((member) => {
          const contributed = byMember.totals.get(member.name) ?? 0;
          const share = byMember.overall > 0 ? (contributed / byMember.overall) * 100 : 0;

          return (
            <li key={member.id} className="rounded-xl border border-slate-100 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 text-xs font-bold uppercase text-white">
                    {member.name?.charAt(0)}
                  </span>

                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate text-sm font-medium text-navy-800">
                      {member.name}
                      {member.role === "OWNER" && <Crown size={12} className="text-amber-500" />}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">@{member.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-navy-800">
                      {formatCurrency(contributed)}
                    </p>
                    {byMember.overall > 0 && (
                      <p className="text-[11px] text-slate-400">{share.toFixed(0)}%</p>
                    )}
                  </div>

                  {isOwner && member.role !== "OWNER" && (
                    <button
                      onClick={() => setToRemove(member)}
                      title="Remover participante"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-expense-50 hover:text-expense-600 cursor-pointer"
                    >
                      <UserMinus size={15} />
                    </button>
                  )}
                </div>
              </div>

              {byMember.overall > 0 && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-400" style={{ width: `${share}%` }} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        isOpen={Boolean(toRemove)}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        title="Remover participante"
        message={`${toRemove?.name} deixará de ver e aportar nesta meta. Os aportes que já fez continuam contando.`}
      />
    </section>
  );
}
