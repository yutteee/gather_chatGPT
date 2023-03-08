# gather_chatGPT

## Overview

### demo

https://user-images.githubusercontent.com/83484258/223734931-6e23b436-cbc0-4f95-ab06-6e43dcf2e9c2.mov

​
You can interact with chatGPT by talking to **"gather_chatGPT"**.
​

You can talk to gather_chatGPT in any of these formats.
​

### cautions

- In any conversation format **other than DM**, you can call him out by prefixing the message with **"%"**.
- He will dance while generating messages, but do not talk to him while he is doing so. What you have told to him will probably be ignored...
  ​

## setup

### 1. Create a dedicated google account.

Create a google account to keep the bot logged in.

### 2. add .env file

```.env
# gather's setting
API_KEY=
SPACE_ID=
# chatGPT's setting
OPENAI_API_KEY=
```

- API_KEY
  ​

  Please log in to gather with the account you just created. In that state, please access the following url to retrieve it.
  url:https://gather.town/apiKeys

- SPACE_ID
  ​

  You can get it from the url of the space in the gather where you want to place the bot.
  https://gather.town/app/{SPACE_ID} (\* **Please change the slash(/) to a backslash(\\).**)

- OPENAI_API_KEY

  You can get it from the url:https://platform.openai.com/account/api-keys

### 3. Install package

```:vim
npm install
```

### 4. Execution

```
node index.js
```
