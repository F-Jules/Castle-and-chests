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
  axiosAction
    .get(exUrl + roomId)
    .then(resRoom => {
      if (resRoom.data.chests.length > 0) {
        for (let i = 0; i < resRoom.data.chests.length; i++) {
          axiosAction
            .get(exUrl + resRoom.data.chests[i])
            .then(resChest => {
              if (
                resChest.data.status &&
                !resChest.data.status.includes(
                  "This chest is empty :/ Try another one!"
                ) &&
                !chestsId.includes(resRoom.data.chests[i])
              ) {
                chestsId.push(resRoom.data.chests[i]);
                fullChest += 1;
                console.log(`WE'VE GOT ${fullChest} full chests so far.`);
              }
            })
            .catch(err => {
              console.log("OUPS THERE WERE AN ERROR CHECKING A CHESTS");
              dealingWithErrors(err);
            });
        }
      }
      if (resRoom.data.rooms.length > 0) {
        for (let i = 0; i < resRoom.data.rooms.length; i++) {
          let newRoom = resRoom.data.rooms[i];
          if (castleMap[newRoom] === undefined) {
            roomNb += 1;
            castleMap[newRoom] = roomNb;
            console.log(`${roomNb} / ${chestsId.length}`);
            checkRooms(newRoom);
          }
        }
      }
    })
    .catch(err => {
      console.log("OUPS THERE WERE AN ERROR CHECKING A ROOM");
      dealingWithErrors(err);
    });
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
