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
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  });
  return completion.data.choices[0].message.content;
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
  if (data.playerChats.recipient === "GLOBAL_CHAT") return;
  if (isReplying) return console.log("chatgptが返信を考えてるよ!");

  const receivedMessage = data.playerChats.contents;
  const chatRecipient = data.playerChats.recipient; // 個人間のメッセージ, nearby, Everyoneのいずれか
  const mapId = context.player.map;

  game.move(4, false); // 応答生成中はダンスをする

  // 参考:http://gather-game-client-docs.s3-website-us-west-2.amazonaws.com/classes/Game.html#chat
  const replyMessage = async function (recipient, message) {
    game.chat(recipient, Object.keys(game.players), mapId, {
      contents: await replyFromChatGPT(message),
    });
    isReplying = false;
    game.move(3, false); //ダンスをストップ
  };

  // どのメッセージの形式にも対応
  if (data.playerChats.messageType === "DM") {
    const recipient = data.playerChats.senderId;
    return replyMessage(recipient, receivedMessage);
  }
  return replyMessage(chatRecipient, receivedMessage);
});
