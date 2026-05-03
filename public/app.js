const status = document.querySelector("#status");
const roomLabel = document.querySelector("#roomLabel");
const playerLabel = document.querySelector("#playerLabel");
const playerXLabel = document.querySelector("#playerXLabel");
const playerOLabel = document.querySelector("#playerOLabel");
const turnLabel = document.querySelector("#turnLabel");
const resultLabel = document.querySelector("#resultLabel");
const message = document.querySelector("#message");
const createRoomButton = document.querySelector("#createRoom");
const joinForm = document.querySelector("#joinForm");
const nicknameInput = document.querySelector("#nicknameInput");
const roomInput = document.querySelector("#roomInput");
const leaveButton = document.querySelector("#leaveRoom");
const resetButton = document.querySelector("#resetGame");
const board = document.querySelector("#board");

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socketUrl = `${protocol}//${window.location.host}/game`;
const STORAGE_KEY = "ws-chat/session";
let socket = null;
let reconnectTimer = null;
let reconnectAttempts = 0;

let roomId = null;
let player = null;
let state = {
  board: Array(9).fill(null),
  turn: "X",
  players: {},
  winner: null,
};

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { nickname: "", roomId: "" };
    }

    const parsed = JSON.parse(raw);
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
      roomId: typeof parsed.roomId === "string" ? parsed.roomId : "",
    };
  } catch {
    return { nickname: "", roomId: "" };
  }
}

function saveSession() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      nickname: nicknameInput.value.trim(),
      roomId: roomInput.value.trim(),
    }),
  );
}

function tryAutoJoin() {
  const nickname = nicknameInput.value.trim();
  const storedRoomId = roomInput.value.trim();

  if (!nickname || !storedRoomId) {
    return;
  }

  send({ type: "join_room", roomId: storedRoomId, nickname });
}

function send(payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    setMessage("Connection is not ready.");
    return;
  }

  socket.send(JSON.stringify(payload));
}

function setStatus(text, className) {
  status.textContent = text;
  status.className = `status ${className}`;
}

function setMessage(text) {
  message.textContent = text;
}

function getNickname() {
  const nickname = nicknameInput.value.trim();

  if (!nickname) {
    setMessage("Enter a nickname.");
    nicknameInput.focus();
    return null;
  }

  return nickname;
}

function renderBoard() {
  board.replaceChildren();

  state.board.forEach((value, index) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.type = "button";
    cell.textContent = value === "EMPTY" || value == null ? "" : value;
    cell.ariaLabel = `Cell ${index + 1}`;
    cell.disabled = !canMove(index);
    cell.addEventListener("click", () => {
      send({ type: "make_move", roomId, cellIndex: index });
    });
    board.append(cell);
  });
}

function canMove(index) {
  const value = state.board[index];
  return Boolean(
    roomId &&
      player &&
      player !== "spectator" &&
      state.turn === player &&
      !state.winner &&
      (value === "EMPTY" || value == null),
  );
}

function resetLobbyState() {
  roomId = null;
  player = null;
  state = {
    board: Array(9).fill(null),
    turn: "X",
    players: {},
    winner: null,
  };
  roomInput.value = "";
  saveSession();
}

function renderState() {
  roomLabel.textContent = roomId ? `Room ${roomId}` : "No room joined";
  playerLabel.textContent = player ?? "-";
  playerXLabel.textContent = state.players.X ?? "Waiting";
  playerOLabel.textContent = state.players.O ?? "Waiting";
  turnLabel.textContent = state.players[state.turn]
    ? `${state.turn} - ${state.players[state.turn]}`
    : state.turn ?? "-";

  if (state.winner === "draw") {
    resultLabel.textContent = "Draw";
  } else if (state.winner) {
    resultLabel.textContent = `${state.winner} won`;
  } else {
    resultLabel.textContent = "Playing";
  }

  leaveButton.disabled = !roomId;
  resetButton.disabled = !roomId;
  renderBoard();
}

function handleRoomJoined(payload) {
  roomId = payload.roomId;
  player = payload.player;
  roomInput.value = roomId;
  saveSession();
  setMessage(`Joined as ${player}. Share room ${roomId}.`);
  renderState();
}

function handleGameState(payload) {
  roomId = payload.roomId;
  state = {
    board: payload.board,
    turn: payload.turn,
    players: payload.players ?? {},
    winner: payload.winner,
  };
  renderState();
}

function scheduleReconnect() {
  if (reconnectTimer) {
    return;
  }

  reconnectAttempts += 1;
  const waitMs = Math.min(1000 * reconnectAttempts, 5000);
  setStatus("Reconnecting", "offline");
  setMessage(`Disconnected. Retrying in ${Math.ceil(waitMs / 1000)}s...`);

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectSocket();
  }, waitMs);
}

function connectSocket() {
  socket = new WebSocket(socketUrl);

  socket.addEventListener("open", () => {
    reconnectAttempts = 0;
    setStatus("Online", "online");
    createRoomButton.disabled = false;
    setMessage("Create a room or join one with a room id.");
    tryAutoJoin();
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);

    if (payload.type === "room_joined") {
      handleRoomJoined(payload);
      return;
    }

    if (payload.type === "game_state") {
      handleGameState(payload);
      return;
    }

    if (payload.type === "error") {
      setMessage(payload.message);
    }
  });

  socket.addEventListener("close", () => {
    createRoomButton.disabled = true;
    leaveButton.disabled = true;
    resetButton.disabled = true;
    scheduleReconnect();
  });

  socket.addEventListener("error", () => {
    socket?.close();
  });
}

createRoomButton.addEventListener("click", () => {
  const nickname = getNickname();

  if (!nickname) {
    return;
  }

  saveSession();
  send({ type: "create_room", nickname });
});

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nickname = getNickname();
  const requestedRoomId = roomInput.value.trim();

  if (!nickname) {
    return;
  }

  if (!requestedRoomId) {
    setMessage("Enter a room id.");
    roomInput.focus();
    return;
  }

  saveSession();
  send({ type: "join_room", roomId: requestedRoomId, nickname });
});

resetButton.addEventListener("click", () => {
  send({ type: "reset_game", roomId });
});

leaveButton.addEventListener("click", () => {
  if (!roomId) {
    return;
  }

  send({ type: "leave_room" });
  resetLobbyState();
  setMessage("Left room. Create or join again.");
  renderState();
});

const savedSession = loadSession();
nicknameInput.value = savedSession.nickname;
roomInput.value = savedSession.roomId;

connectSocket();
renderState();
