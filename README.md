                                            **MAIN AUTHOR @ksqxszq**
# Blessing Assistant - The Intelligent Partner for Blockless Network 🤖🎉

## What is this assistant?
Blessing Assistant is an intelligent tool designed specifically for serverless network enthusiasts. It automates node management and provides real-time feedback, making it easy to manage everything on your serverless network journey!

## Preparation
1. You need to install [Node.js](https://nodejs.org/), version 12 or higher.
2. The assistant is currently licensed under the `MIT` license, so you can freely use and share it.

## How to Install?
1. **Download the Assistant**: Clone the project to your local computer.
   ```bash
   git clone https://github.com/ziqing888/Bless-Bot.git
   ```
   Then, go to the directory:
   ```bash
   cd Bless-Bot
   ```

## Configuration and Setup - The Assistant’s Secret Guide 🗝️
1. Create a `user.txt` file and paste your token `B7S_AUTH_TOKEN` directly into it. The format should look like this:
   ```bash
   eyJhbGciOiJIUxxx...（complete authentication token）
   ```
   You can get the token from the user panel (view local storage in the developer tools [F12] or directly input the following in the console):
   ```bash
   localStorage.getItem('B7S_AUTH_TOKEN')
   ```

2. Then, download the extension.
   After downloading, open it in the browser with the following URL:
   `chrome://extensions/?id=pljbjcehnhcnofmkdbjolghdcjnmekia`

3. Next, find the `nodeid (pubkey)` and `hardwareid`.

4. Place them in the `id.txt` file in the following format:
   ```bash
   12D31pubKey：2a59fef6472e7hardwareId
   12D3KooWIF5Z2：ebe157ac7357166885b072bb2722fe
   ```

   If you're using a proxy, edit the `proxy.txt` file.
   
   Each account can have up to 5 `nodeid`s, and they cannot be deleted. It is recommended to save your account’s `Nodeid (pubkey)` and `hardwareid`.

If you're running a proxy, you need to generate the device's `publicKey` and `hardwareID` first.

Use the command:
```bash
node generate_mac.js
```
