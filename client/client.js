const SERVER_HTTP_API = "http://localhost:5000";

start();

function start() {
  // startShortPolling(5000);
  startLongPolling();
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

function addUsersToHTML(users) {
  const usersDiv = document.querySelector(".users-list");
  users.forEach((user) => {
    const userDiv = document.createElement("div");
    userDiv.textContent = `${user.name} ${user.surname}`;
    usersDiv.appendChild(userDiv);
  });
}
