const axios = require("axios");
const { performance } = require("perf_hooks");

const Agent = require("agentkeepalive");
const keepAliveAgent = new Agent({
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000
});

const axiosAction = axios.create({ httpAgent: keepAliveAgent });

const exUrl = "http://mediarithmics.francecentral.cloudapp.azure.com:3000";
const entryId = "/castles/1/rooms/entry";

let fullChest = 0;
let idRooms = ["entry"];
let idChests = [];

checkRooms = async roomId => {
  try {
    const resRoom = await axiosAction.get(exUrl + roomId);
    if (idRooms.length === 100) {
      console.log(
        `SCRIPT OVER: All rooms have been checked for a total of ${idRooms.length} and we've got ${fullChest} full chests.`
      );
      return;
    }
    for (let i = 0; i < resRoom.data.rooms.length; i++) {
      if (!idRooms.includes(resRoom.data.rooms[i])) {
        idRooms.push(resRoom.data.rooms[i]);
        console.log(idRooms);
      }
    }
    for (let i = 0; i < idRooms.length; i++) {
      checkRooms(idRooms[i]);
    }
    if (resRoom.data.chests.length > 0) {
      for (let x = 0; x < resRoom.data.chests.length; x++) {
        checkChests(resRoom.data.chests[x]);
      }
    }
  } catch (err) {
    console.log("OUPS THERE WERE AN ERROR CHECKING A ROOM", err);
  }
};

checkChests = async chestId => {
  try {
    const resChest = await axiosAction.get(exUrl + chestId);
    if (
      resChest.data.status &&
      !resChest.data.status.includes(
        "This chest is empty :/ Try another one!"
      ) &&
      !idChests.includes(resChest.data.id)
    ) {
      fullChest += 1;
      idChests.push(resChest.data.id);
      console.log(`WE'VE GOT ${fullChest} full chests so far.`);
    }
  } catch (err) {
    console.log("OUPS THERE WERE AN ERROR CHECKING A CHESTS", err);
  }
};

checkRooms(entryId);
