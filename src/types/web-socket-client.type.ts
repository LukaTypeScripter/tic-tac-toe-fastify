export type WebSocketClient = {
  readyState: number;
  send(message: string): void;
};
