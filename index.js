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
game.subscribeToConnection((connected) => console.log("connected?", connected));

game.subscribeToEvent("playerChats", (data, context) => {
  // chatGPTの応答に対して、イベントが走らないようにする
  if (data.playerChats.senderName === BOT_NAME) return;
  // roomでのメッセージに対して返答しないようにする
  if (data.playerChats.recipient === "ROOM_CHAT") return;
  if (isReplying) return console.log("chatgptが返信を考えてるよ!");
  console.log(data);

  const receivedMessage = data.playerChats.contents;
  const chatRecipient = data.playerChats.recipient;
  const mapId = context.player.map;

  game.move(4, false); // 応答生成中はダンスをする

  // chatをgatherで返すための関数
  // 参考:http://gather-game-client-docs.s3-website-us-west-2.amazonaws.com/classes/Game.html#chat
  const replyMessage = async function (recipient, message) {
    game.chat(recipient, Object.keys(game.players), mapId, {
      contents: await replyFromChatGPT(message),
    });
    isReplying = false;
    game.move(3, false); //ダンスをストップ
  };

  // DM, nearbyに対応
  if (data.playerChats.messageType === "DM") {
    const recipient = data.playerChats.senderId;
    return replyMessage(recipient, receivedMessage);
  }
  return replyMessage(chatRecipient, receivedMessage);
});
