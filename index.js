require("dotenv").config();
const { Game } = require("@gathertown/gather-game-client");
global.WebSocket = require("isomorphic-ws");
const { Configuration, OpenAIApi } = require("openai");

// chatGPTの設定
// 参考：https://platform.openai.com/docs/api-reference/chat/create?lang=node.js
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const aaa = async function () {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "こんにちは。わかったら返事をしろ" }],
  });
  console.log(completion.data.choices[0].message);
};

aaa();

// gatherに接続する
// 参考:https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063
// const game = new Game(process.env.SPACE_ID, () => Promise.resolve({ apiKey: process.env.API_KEY }));
// game.connect();
// game.subscribeToConnection((connected) => console.log("connected?", connected));

// game.subscribeToEvent("playerChats", (data, context) => {
//   // chatGPTの応答にイベントが走らないようにする
//   if (data.playerChats.senderId === process.env.BOT_ID) return;

//   console.log(
//     context?.player?.name ?? context.playerId,
//     "send a message",
//     data.playerChats.contents
//   );

//   const chatRecipient = data.playerChats.recipient; // 個人間のメッセージ, nearby, Everyoneのいずれか
//   const mapId = context.player.map;

//   // 参考:http://gather-game-client-docs.s3-website-us-west-2.amazonaws.com/classes/Game.html#chat
//   const replyMessage = function (recipient) {
//     game.chat(recipient, Object.keys(game.players), mapId, {
//       contents: "私はchatgptです",
//     });
//   };

//   // どのメッセージの形式にも対応
//   if (data.playerChats.messageType === "DM") {
//     const recipient = data.playerChats.senderId;
//     return replyMessage(recipient);
//   }
//   return replyMessage(chatRecipient);
// });
