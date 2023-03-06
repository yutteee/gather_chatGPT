require("dotenv").config();
const { Game } = require("@gathertown/gather-game-client");
global.WebSocket = require("isomorphic-ws");

/**** setup ****/

// gatherに接続する
// 参考:https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063
const game = new Game(process.env.SPACE_ID, () => Promise.resolve({ apiKey: process.env.API_KEY }));
game.connect();
game.subscribeToConnection((connected) => console.log("connected?", connected));

game.subscribeToEvent("playerChats", (data, context) => {
  console.log(
    context?.player?.name ?? context.playerId,
    "send a message",
    data.playerChats.contents
  );
});
