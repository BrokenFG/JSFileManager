import prompt from 'prompt-sync';
import os from "os";
import fs from "fs";
import crypto from "crypto";
import { createReadStream, createWriteStream } from 'fs';
import { createGzip, createGunzip } from 'zlib';
let args = process.argv.slice(2);
let userNameKey = "username"
let username;
for (let i = 0; i < args.length; i++) {
    if (args[i].includes(userNameKey)) {
        username = args[i].split('=')[1]
    }
}
console.log("Welcome to the File Manager, " + username + "!");
//change directory to the user's home directory
process.chdir(os.homedir())

while (true) {
    let currentPath = process.cwd();
    console.log("You are currently in " + currentPath);
    let command = prompt()("Enter a command: ");
    let commandArgs = command.split(' ');
    let commandName = commandArgs[0];
    let commandArgsList = commandArgs.slice(1);
    if (commandName === '.exit') {
        console.log("Thank you for using File Manager, " + username + ", goodbye!")
        break;
    }
    try {
        switch (commandName) {
            case 'cd':
                process.chdir(commandArgsList[0]);
                break;
            case "up":
                process.chdir("..");
                break;
            case "ls":
                for (let file of fs.readdirSync(currentPath)) {
                    let fileName = file;
                    let fileType = fs.statSync(file).isDirectory() ? "Directory" : "File";
                    console.log(fileName + " - " + fileType);
                }
                break;
            case "cat":
                let fileContent = fs.readFileSync(commandArgsList[0], 'utf-8');
                console.log(fileContent);
                break;
            case "add":
                fs.writeFileSync(commandArgsList[0], commandArgsList.length > 1 ? commandArgsList.slice(1).join(' ') : '');
                break;
            case "rn":
                fs.renameSync(commandArgsList[0], commandArgsList[1]);
                break;
            case "cp":
                fs.copyFileSync(commandArgsList[0], commandArgsList[1]);
                break;
            case "rm":
                fs.unlinkSync(commandArgsList[0]);
                break;
            case "mv":
                let source = commandArgsList[0];
                let destination = commandArgsList[1];
                let sourceFile = fs.readFileSync(source, 'utf-8');
                if (fs.statSync(destination).isDirectory()) {
                    destination += '/' + source;
                }
                fs.writeFileSync(destination, sourceFile);
                fs.unlinkSync(source);
                break;
            case "os":
                if (commandArgsList.length === 0) {
                    console.log("Invalid Input");
                    break;
                }
                switch (commandArgsList[0]) {
                    case "--EOL":
                        console.log(os.EOL);
                        break;
                    case "--homedir":
                        console.log(os.homedir());
                        break;
                    case "--username":
                        console.log(os.userInfo().username);
                        break;
                    case "--architecture":
                        console.log(os.arch());
                        break;
                    default:
                        console.log("Invalid Input");
                        break;
                }
                break;
            case "hash":
                let hash = crypto.createHash('sha256');
                let data = fs.readFileSync(commandArgsList[0]);
                let hashedData = hash.update(data).digest('hex');
                console.log(hashedData);
                break;
            case "compress":
                let gzip = createGzip();
                let inputCompress = commandArgsList[0];
                let outputCompress = commandArgsList[1];
                let sourceFIleCompress = createReadStream(inputCompress);
                let destinationFileCompress = createWriteStream(outputCompress);
                sourceFIleCompress.pipe(gzip).pipe(destinationFileCompress);
                break;
            case "decompress":
                let gunzip = createGunzip();
                let input = commandArgsList[0];
                let output = commandArgsList.length > 1 ? commandArgsList[1] : input.replace('.gz', '');
                let sourceFileDecompress = createReadStream(input);
                let destinationFile = createWriteStream(output);
                sourceFileDecompress.pipe(gunzip).pipe(destinationFile);
                break;
            default:
                console.log("Invalid Input");
                break;
        }
    } catch (error) {
        console.log("Invalid Input" + error);
    }
}