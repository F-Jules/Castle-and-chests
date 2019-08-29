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

let fullChest = 0;
let idRooms = [entryId];
let idChests = [];

checkRooms = async roomId => {
  try {
    const resRoom = await axiosAction.get(exUrl + roomId);
    if (resRoom.data.chests.length > 0) {
      for (let i = 0; i < resRoom.data.chests.length; i++) {
        checkChests(resRoom.data.chests[i]);
      }
    }
    for (let i = 0; i < resRoom.data.rooms.length; i++) {
      if (!idRooms.includes(resRoom.data.rooms[i])) {
        idRooms.push(resRoom.data.rooms[i]);
        console.log(idRooms.length);
        for (let i = 0; i < idRooms.length; i++) {
          checkRooms(idRooms[i]);
        }
      }
    }
  } catch (err) {
    console.log("OUPS THERE WERE AN ERROR CHECKING A ROOM");
    dealingWithErrors(err);
  }
};

checkChests = async chestId => {
  try {
    const resChest = await axiosAction.get(exUrl + chestId);
    console.log("CHECKING CHEST ATM !", fullChest);
    if (
      resChest.data.status &&
      !resChest.data.status.includes(
        "This chest is empty :/ Try another one!"
      ) &&
      !idChests.includes(resChest.data.id)
    ) {
      idChests.push(resRoom.data.chests[x]);
      fullChest += 1;
      console.log(`WE'VE GOT ${fullChest} full chests so far.`);
    }
  } catch (err) {
    console.log("OUPS THERE WERE AN ERROR CHECKING A CHESTS");
    dealingWithErrors(err);
  }
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
