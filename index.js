require("dotenv").config();
const { Game } = require("@gathertown/gather-game-client");
global.WebSocket = require("isomorphic-ws");
const { Configuration, OpenAIApi } = require("openai");

BOT_NAME = "gather_chatGPT";
let isReplying = false;

// chatGPTの設定
// 参考：https://platform.openai.com/docs/api-reference/chat/create?lang=node.js
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const replyFromChatGPT = async function (message) {
  isReplying = true;
  const reply = await openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    })
    .then((res) => {
      console.log(res.data.choices[0].message.content);
      return res.data.choices[0].message.content;
    })
    .catch((err) => {
      console.log(err);
      return "chatGPTの調子が悪いみたい...";
    });
  return reply;
};

// gatherに接続する
// 参考:https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063
const game = new Game(process.env.SPACE_ID, () => Promise.resolve({ apiKey: process.env.API_KEY }));
game.connect();
game.subscribeToConnection((connected) => {
  console.log("connected?", connected);
});

// chatGPTくんの座標を取得する関数
const searchBotCoordinate = function () {
  const botPlayers = Object.values(game.players).filter((player) => player.name === BOT_NAME);
  return botPlayers.map((player) => ({ x: player.x, y: player.y }));
};

const nearbyPlayersIds = function () {
  const coordinate = searchBotCoordinate()[0];
  const nearbyPlayers = game.filterPlayersInSpace((player) => {
    return (
      coordinate.x - 3 <= player.x &&
      player.x <= coordinate.x + 3 &&
      coordinate.y - 4 <= player.y &&
      player.y <= coordinate.y + 2
    );
  });

  const playerIdArray = Object.entries(game.players)
    .filter(([key, value]) =>
      nearbyPlayers.some((nearbyPlayer) => JSON.stringify(nearbyPlayer) === JSON.stringify(value))
    )
    .map(([key]) => key);
  return playerIdArray;
};

game.subscribeToEvent("playerChats", (data, context) => {
  // DM以外では、%を先頭につけていないと受け取らないようにした
  if (data.playerChats.messageType !== "DM" && data.playerChats.contents.charAt(0) !== "%") return;
  if (data.playerChats.senderName === BOT_NAME) return; // chatGPTの応答に対して、イベントが走らないようにする
  if (isReplying) return console.log("chatgptが返信を考えてるよ!");

  const receivedMessage = data.playerChats.contents.substring(1);
  const chatRecipient = data.playerChats.recipient;
  const mapId = context.player.map;

  game.move(4, false); // 応答生成中はダンスをする

  // chatをgatherで返すための関数
  // 参考:http://gather-game-client-docs.s3-website-us-west-2.amazonaws.com/classes/Game.html#chat
  const replyMessage = async function (recipient, nearby, message) {
    console.log(message);
    game.chat(recipient, nearby, mapId, {
      contents: await replyFromChatGPT(message),
    });
    isReplying = false;
    game.move(3, false); //ダンスをストップ
  };

  // DM, nearbyに対応
  if (data.playerChats.messageType === "DM") {
    const recipient = data.playerChats.senderId;
    return replyMessage(recipient, Object.keys(game.players), receivedMessage);
  }
  const nearbyPlayers = nearbyPlayersIds();
  return replyMessage(chatRecipient, nearbyPlayers, receivedMessage);
});
