const axios = require("axios");

const Agent = require("agentkeepalive");
const keepAliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000
});

const axiosAction = axios.create({
  baseURL: "http://mediarithmics.francecentral.cloudapp.azure.com:3000",
  httpAgent: keepAliveAgent
});

const entryId = "/castles/1/rooms/entry";

let castleMap = new Object();
let chestsId = new Object();
let fullChest = 0;
let roomNb = 0;
castleMap[entryId] = roomNb;

checkRooms = roomId => {
  let firstCall = axiosAction.get(roomId);
  axios
    .all([firstCall])
    .then(resRoom => {
      checkChests(resRoom[0].data.chests.map(axiosAction.get));
      resRoom[0].data.rooms.map(oneRoom => {
        if (castleMap[oneRoom] === undefined) {
          roomNb += 1;
          castleMap[oneRoom] = roomNb;
          if (roomNb % 10000 === 0) {
            console.log(roomNb, fullChest);
            checkingMemory();
          }
          checkRooms(oneRoom);
        }
      });
    })
    .catch(err => {
      console.log("OUPS THERE WERE AN ERROR CHECKING A ROOM");
      dealingWithErrors(err);
    });
};

checkChests = ChestArr => {
  axios
    .all(ChestArr)
    .then(res =>
      res.map(oneChest => {
        if (isChestFull(oneChest) && isChecked(oneChest)) {
          rememberChest(oneChest);
          console.log(chestsId);
        }
      })
    )
    .catch(err => dealingWithErrors(err));
};

dealingWithErrors = error => {
  if (error.response) {
    console.log(
      "The request was made and the server responded with astatus code that falls out of the range of 2xx"
    );
    console.log("DATA", error.response.data);
    console.log("STATUS", error.response.status);
    console.log("HEADERS", error.response.headers);
  } else if (error.request) {
    console.log("The request was made but no response was received");
    console.log("REQUEST", error.request);
  } else {
    console.log(
      "Something happened in setting up the request and triggered an Error"
    );
    console.log("Error", error.message);
  }
};

checkingMemory = () => {
  const used = process.memoryUsage();
  for (let key in used) {
    console.log(
      `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
    );
  }
};

isChestFull = chest => chest.data.status.includes("something");

isChecked = chest => chestsId[chest.data.id] === undefined;

rememberChest = chest => {
  fullChest += 1;
  chestsId[chest.data.id] = fullChest;
};

checkRooms(entryId);
