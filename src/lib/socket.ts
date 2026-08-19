import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
    socket = io(url, { autoConnect: true });
  }
  return socket;
}

export function identify(userId: string) {
  const s = getSocket();
  if (s.connected) {
    s.emit("identify", userId);
  } else {
    s.once("connect", () => s.emit("identify", userId));
  }
}
