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
const resetButton = document.querySelector("#resetGame");
const board = document.querySelector("#board");

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(`${protocol}//${window.location.host}/game`);

let roomId = null;
let player = null;
let state = {
  board: Array(9).fill(null),
  turn: "X",
  players: {},
  winner: null,
};

function send(payload) {
  if (socket.readyState !== WebSocket.OPEN) {
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
    cell.textContent = value ?? "";
    cell.ariaLabel = `Cell ${index + 1}`;
    cell.disabled = !canMove(index);
    cell.addEventListener("click", () => {
      send({ type: "make_move", roomId, cellIndex: index });
    });
    board.append(cell);
  });
}

function canMove(index) {
  return Boolean(
    roomId &&
      player &&
      player !== "spectator" &&
      state.turn === player &&
      !state.winner &&
      !state.board[index],
  );
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

  resetButton.disabled = !roomId;
  renderBoard();
}

function handleRoomJoined(payload) {
  roomId = payload.roomId;
  player = payload.player;
  roomInput.value = roomId;
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

socket.addEventListener("open", () => {
  setStatus("Online", "online");
  createRoomButton.disabled = false;
  setMessage("Create a room or join one with a room id.");
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
  setStatus("Offline", "offline");
  createRoomButton.disabled = true;
  resetButton.disabled = true;
  setMessage("Disconnected from server.");
});

createRoomButton.addEventListener("click", () => {
  const nickname = getNickname();

  if (!nickname) {
    return;
  }

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

  send({ type: "join_room", roomId: requestedRoomId, nickname });
});

resetButton.addEventListener("click", () => {
  send({ type: "reset_game", roomId });
});

renderState();
