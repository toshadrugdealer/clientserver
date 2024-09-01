const SERVER_HTTP_API = "http://localhost:5000";
const SERVER_WS_API = "ws://localhost:8080";

start();

function start() {
  // startShortPolling(5000);
  // startLongPolling();
  // startWebSocket();
  startServerSentEvents();
}

function startShortPolling(delay, lastUserIndex = 0) {
  setTimeout(async () => {
    const response = await fetch(
      `${SERVER_HTTP_API}/short-polling?last=${lastUserIndex}`
    );
    const { users, last } = await response.json();
    addUsersToHTML(users);
    startShortPolling(delay, last);
  }, delay);
}

function startLongPolling(lastUserIndex = 0) {
  setTimeout(async () => {
    const response = await fetch(
      `${SERVER_HTTP_API}/long-polling?last=${lastUserIndex}`
    );
    const { users, last } = await response.json();

    addUsersToHTML(users);

    startLongPolling(last);
  }, 0);
}

function startWebSocket() {
  const ws = new WebSocket(`${SERVER_WS_API}/ws`);
  const params = { lastUserIndex: 0 };

  ws.onopen = () => {
    console.log("Connected ws");

    const paramsToString = JSON.stringify(params);
    ws.send(paramsToString);
  };
  ws.onmessage = (event) => {
    const { users, last } = JSON.parse(event.data);
    addUsersToHTML(users);
  };
  ws.onclose = () => {
    console.log("Connection closed");
  };
  ws.onerror = (error) => {
    console.error(error);
  };
}

function startServerSentEvents() {
  const lastUserIndex = 0;
  const eventSource = new EventSource(
    `${SERVER_HTTP_API}/server-sent-event?last=${lastUserIndex}`
  );
  eventSource.onmessage = (event) => {
    const { users } = JSON.parse(event.data);
    addUsersToHTML(users);
  };
}

function addUsersToHTML(users) {
  const usersDiv = document.querySelector(".users-list");
  users.forEach((user) => {
    const userDiv = document.createElement("div");
    userDiv.textContent = `${user.name} ${user.surname}`;
    usersDiv.appendChild(userDiv);
  });
}
