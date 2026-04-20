"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type GoalUpdatedPayload = {
  goalId: string;
  currentValue: string;
  userName: string;
  amount: number;
  action: "created" | "updated" | "deleted";
};

type UseGoalSocketOptions = {
  onGoalUpdated?: (payload: GoalUpdatedPayload) => void;
};

/**
 * Hook que conecta ao WebSocket do backend (namespace /goals)
 * e escuta eventos de atualização de metas em tempo real.
 */
export function useGoalSocket({ onGoalUpdated }: UseGoalSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onGoalUpdated);

  // Mantém a referência do callback atualizada sem reconectar
  callbackRef.current = onGoalUpdated;

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) return;

    const socket = io(`${WS_URL}/goals`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[WS] Conectado ao canal de metas");
    });

    socket.on("goal:updated", (payload: GoalUpdatedPayload) => {
      callbackRef.current?.(payload);
    });

    socket.on("disconnect", () => {
      console.log("[WS] Desconectado do canal de metas");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef;
}
