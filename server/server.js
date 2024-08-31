import express from "express";
import cors from "cors";
import { EventEmitter } from "events";

const HTTP_PORT = 5000;
const PUSH_USER = "push-user";

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

app.listen(HTTP_PORT, () => {
  console.log(`server starting ${HTTP_PORT}`);
});

(function pushUser() {
  const delay = Math.floor(Math.random() * 4000);
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
