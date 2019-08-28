const axios = require("axios");
const http = require("http");
const https = require("https");

const Agent = require("agentkeepalive");
const keepAliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000
});

const axiosInstance = axios.create({ httpAgent: keepAliveAgent });

const exUrl = "http://mediarithmics.francecentral.cloudapp.azure.com:3000";
const entryUrl = "/castles/1/rooms/entry";
let fullChest = 0;
let roomNb = 1;

checkRooms = async roomId => {
  try {
    const resRoom = await axiosInstance.get(exUrl + roomId);
    console.log(
      `There is ${resRoom.data.chests.length} chests in this room.`,
      resRoom.data.chests
    );
    console.log(
      `This room leads to ${resRoom.data.rooms.length} others rooms.`,
      resRoom.data.rooms
    );
    if (resRoom.data.chests.length > 0) {
      for (let x = 0; x < resRoom.data.chests.length; x++) {
        checkChests(resRoom.data.chests[x]);
      }
    }
    if (resRoom.data.rooms.length > 0) {
      for (let i = 0; i < resRoom.data.rooms.length; i++) {
        checkRooms(resRoom.data.rooms[i]);
        roomNb += 1;
        console.log(`CHECKING ROOM NUMBER ${roomNb}`);
      }
    } else {
      console.log(
        `SCRIPT OVER: All rooms have been checked for a total of ${roomNb} and we've got ${fullChest} full chests.`
      );
      return;
    }
  } catch (err) {
    console.log("OUPS THERE WERE AN ERROR CHECKING A ROOM", err);
  }
  // == ELSE STOP ==
};

checkChests = async chestId => {
  try {
    const resChest = await axiosInstance.get(exUrl + chestId);
    console.log("A CHEST IS CHECKED ATM !");
    if (
      resChest.data.status &&
      !resChest.data.status.includes("This chest is empty :/ Try another one!")
    ) {
      fullChest += 1;
      console.log(`WE'VE GOT ${fullChest} full chests so far.`);
    }
  } catch (err) {
    console.log("OUPS THERE WERE AN ERROR CHECKING A CHESTS", err);
  }
};

letsLoot = () => {
  checkRooms(entryUrl);
};

letsLoot();
