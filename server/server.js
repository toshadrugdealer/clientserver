import express from "express";
import cors from "cors";
import { EventEmitter } from "events";
import { WebSocketServer } from "ws";

const HTTP_PORT = 5000;
const PUSH_USER = "push-user";
const WS_PORT = 8080;

const app = express();
app.use(cors());
app.use(express.json());

const usersDB = [];

const eventEmitter = new EventEmitter();

app.get("/", (req, res) => {
  res.send("Hello blyat!");
});

app.get("/short-polling", (req, res) => {
  const { last } = req.query;
  const fetchUsers = usersDB.slice(last, usersDB.length);

  res.status(200).json({ users: fetchUsers, last: usersDB.length });
});

app.get("/long-polling", (req, res) => {
  const { last } = req.query;

  eventEmitter.once(PUSH_USER, () => {
    const fetchUsers = usersDB.slice(last, usersDB.length);

    res.status(200).json({ users: fetchUsers, last: usersDB.length });
  });
});

app.get("/server-sent-event", (req, res) => {
  const { last } = req.query;
  let lastUserIndex = last;

  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  eventEmitter.on(PUSH_USER, () => {
    const fetchUsers = usersDB.slice(lastUserIndex, usersDB.length);
    lastUserIndex = usersDB.length;
    const data = JSON.stringify({ users: fetchUsers, last: lastUserIndex });

    res.write(`data: ${data} \n\n`);
  });
});

app.listen(HTTP_PORT, () => {
  console.log(`server starting ${HTTP_PORT}`);
});

const wss = new WebSocketServer(
  { port: WS_PORT },
  () => `ws soket is running on port ${WS_PORT}`
);
wss.on("connection", (ws) => {
  let last = 0;
  ws.on("error", console.error);

  ws.on("message", (data) => {
    const { lastUserIndex } = JSON.parse(data);
    last = lastUserIndex;
  });
  eventEmitter.on(PUSH_USER, () => {
    const fetchUsers = usersDB.slice(last, usersDB.length);
    last = usersDB.length;

    const data = JSON.stringify({ users: fetchUsers, last });

    ws.send(data);
  });
});

(function pushUser() {
  const delay = Math.floor(Math.random() * 10000);
  setTimeout(() => {
    const user = generateUser();
    usersDB.push(user);
    eventEmitter.emit(PUSH_USER);

    pushUser();
  }, delay);
})();

function generateUser() {
  const names = [
    "Alexander",
    "Maria",
    "Dmitry",
    "Anna",
    "Ekaterina",
    "Ivan",
    "Sofia",
    "Maxim",
    "Olga",
    "Vladimir",
    "Sergey",
    "Natalia",
    "Pavel",
    "Elena",
    "Yuri",
    "Irina",
    "Andrei",
    "Tatiana",
    "Nikolai",
    "Galina",
  ];
  const surnames = [
    "Ivanov",
    "Petrov",
    "Sidorov",
    "Smirnov",
    "Kuznetsov",
    "Popov",
    "Vasiliev",
    "Pavlov",
    "Sokolov",
    "Mikhailov",
    "Fedorov",
    "Morozov",
    "Volkov",
    "Lebedev",
    "Novikov",
    "Zaitsev",
    "Soloviev",
    "Karpov",
    "Nikolaev",
    "Orlov",
  ];
  const randomNames = names[Math.floor(Math.random() * names.length)];
  const randomSurnames = surnames[Math.floor(Math.random() * surnames.length)];

  return { name: randomNames, surname: randomSurnames };
}
