"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useCookies } from "react-cookie";
import { io, type Socket } from "socket.io-client";
import { socket_url } from "@/lib/utils";

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [cookies] = useCookies(["accessToken"]);
  const token: string | undefined = cookies.accessToken;

  const socketRef = useRef<Socket | null>(null);

  const socket = useMemo<Socket | null>(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return null;
    }

    if (socketRef.current?.connected) return socketRef.current;

    if (socketRef.current) socketRef.current.disconnect();

    const s = io(socket_url, {
      transports: ["websocket"],
      auth: { token },
      autoConnect: true,
    });

    socketRef.current = s;
    return s;
  }, [token]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
