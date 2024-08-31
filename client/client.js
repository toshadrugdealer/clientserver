const SERVER_HHTP_API = "http://localhost:5000";

start();

function start() {
  startShortPolling(5000);
}

function startShortPolling(delay, lastUserIndex = 0) {
  setTimeout(async () => {
    const response = await fetch(
      `${SERVER_HHTP_API}/short-polling?last=${lastUserIndex}`
    );
    const { users, last } = await response.json();
    addUsersToHTML(users);
    startShortPolling(delay, last);
  }, delay);
}
function addUsersToHTML(users) {
  const usersDiv = document.querySelector(".users-list");
  users.forEach((user) => {
    const userDiv = document.createElement("div");
    userDiv.textContent = `${user.name} ${user.surname}`;
    usersDiv.appendChild(userDiv);
  });
}
