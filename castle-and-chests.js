const axios = require("axios");
const exUrl = "http://mediarithmics.francecentral.cloudapp.azure.com:3000";
const entryUrl = "/castles/1/rooms/entry";
let fullChest = 0;
let roomNb = 1;
let min = 0;

checkRooms = roomId => {
  // == FIRST CALL IN THE ENTRY ==
  axios
    .get(exUrl + roomId)
    .then(res => {
      console.log(
        `There is ${res.data.chests.length} chests in this room.`,
        res.data.chests
      );
      console.log(
        `This room leads to ${res.data.rooms.length} others rooms.`,
        res.data.rooms
      );
      // == CHESTS CHECK ==
      if (res.data.chests.length > 0) {
        for (let x = 0; x < res.data.chests.length; x++) {
          checkChests(res.data.chests[x]);
        }
      }
      // == IF ADJACENTS ROOMS GO FOR IT
      if (res.data.rooms.length > 0) {
        for (let i = 0; i < res.data.rooms.length; i++) {
          checkRooms(res.data.rooms[i]);
          roomNb += 1;
          console.log(`CHECKING ROOM NUMBER ${roomNb}`);
        }
        // == ELSE STOP ==
      } else
        console.log(
          `SCRIPT OVER / IN ${min} MINUTES: All rooms have been checked for a total of ${roomNb} and we've got ${fullChest} full chests.`
        );
    })
    .catch(err => console.log("OUPS THERE WERE AN ERROR CHECKING A ROOM"));
};

checkChests = chestId => {
  axios
    .get(exUrl + chestId)
    .then(res => {
      console.log("A CHEST IS CHECKED ATM !");
      if (
        res.data.status &&
        !res.data.status.includes("This chest is empty :/ Try another one!")
      ) {
        fullChest += 1;
        console.log(`We have got ${fullChest} full chests so far.`);
      }
    })
    .catch(err => console.log("OUPS THERE WERE AN ERROR CHECKING A CHESTS"));
};

letsLoot = () => {
  checkRooms(entryUrl);
};

letsLoot();

// checkRooms = async roomId => {
//   // == FIRST CALL IN THE ENTRY ==
//   const res = await axios.get(exUrl + roomId);
//   console.log(
//     `There is ${res.data.chests.length} chests in this room.`,
//     res.data.chests
//   );
//   console.log(
//     `This room leads to ${res.data.rooms.length} others rooms.`,
//     res.data.rooms
//   );
//   // == CHESTS CHECK ==
//   if (res.data.chests.length > 0) {
//     for (let x = 0; x < res.data.chests.length; x++) {
//       checkChests(res.data.chests[x]);
//     }
//   }
//   // == IF ADJACENTS ROOMS GO FOR IT
//   if (res.data.rooms.length > 0) {
//     for (let i = 0; i < res.data.rooms.length; i++) {
//       checkRooms(res.data.rooms[i]);
//       roomNb += 1;
//       console.log(`CHECKING ROOM NUMBER ${roomNb}`);
//     }
//     // == ELSE STOP ==
//   } else
//     console.log(
//       `SCRIPT OVER / IN ${min} MINUTES: All rooms have been checked for a total of ${roomNb} and we've got ${fullChest} full chests.`
//     );
// };
