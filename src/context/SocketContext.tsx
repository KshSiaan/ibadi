"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
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
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const s = io(socket_url, {
      transports: ["websocket"],
      auth: { token },
      autoConnect: true,
    });

    s.onAny((event, ...args) => {
      console.log("[socket:in]", event, ...args);
    });
    s.onAnyOutgoing((event, ...args) => {
      console.log("[socket:out]", event, ...args);
    });
    s.on("connect", () => console.log("[socket:connect]", s.id));
    s.on("disconnect", (reason) => console.log("[socket:disconnect]", reason));
    s.on("connect_error", (err) => console.log("[socket:connect_error]", err));

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
