const axios = require("axios");

const Agent = require("agentkeepalive");
const keepAliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000
});

const axiosAction = axios.create({
  httpAgent: keepAliveAgent
});

const exUrl = "http://mediarithmics.francecentral.cloudapp.azure.com:3000";
const entryId = "/castles/1/rooms/entry";

let castleMap = new Object();
let chestsId = [];
let fullChest = 0;
let roomNb = 0;
castleMap[entryId] = roomNb;

checkRooms = roomId => {
  let firstCall = axiosAction.get(exUrl + roomId);
  axios
    .all([firstCall])
    .then(resRoom => {
      if (resRoom[0].data.chests.length > 0) {
        let temporaryChestArray = [];
        for (let i = 0; i < resRoom[0].data.chests.length; i++) {
          temporaryChestArray.push(
            axiosAction.get(exUrl + resRoom[0].data.chests[i])
          );
        }
        checkChests(temporaryChestArray);
      }
      if (resRoom[0].data.rooms.length > 0) {
        let temporaryRoomArray = [];
        for (let i = 0; i < resRoom[0].data.rooms.length; i++) {
          let newRoom = resRoom[0].data.rooms[i];
          if (castleMap[newRoom] === undefined) {
            roomNb += 1;
            castleMap[newRoom] = roomNb;
            if (roomNb % 10000 === 0) {
              const used = process.memoryUsage();
              for (let key in used) {
                console.log(
                  `${key} ${Math.round((used[key] / 1024 / 1024) * 100) /
                    100} MB`
                );
              }
              console.log(roomNb, chestsId.length);
            }
            temporaryRoomArray.push(checkRooms(newRoom));
          }
        }
      }
    })
    .catch(err => {
      console.log("OUPS THERE WERE AN ERROR CHECKING A ROOM");
      dealingWithErrors(err);
    });
};

checkChests = ChestArr => {
  axios
    .all(ChestArr)
    .then(res => {
      for (let i = 0; i < res.length; i++) {
        if (
          res[i].data.status &&
          !res[i].data.status.includes(
            "This chest is empty :/ Try another one!"
          ) &&
          !chestsId.includes(res[i].data.id)
        ) {
          chestsId.push(res[i].data.id);
          fullChest += 1;
          console.log(`WE'VE GOT ${fullChest} full chests so far.`);
        }
      }
    })
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

checkRooms(entryId);
