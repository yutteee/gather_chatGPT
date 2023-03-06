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

  const chatRecipient = data.playerChats.recipient; // 個人間のメッセージ, nearby, Everyoneのいずれか
  const mapId = context.player.map;

  // 参考:http://gather-game-client-docs.s3-website-us-west-2.amazonaws.com/classes/Game.html#chat
  game.chat(chatRecipient, Object.keys(game.players), mapId, {
    contents: "私はchatgptです",
  });
});
