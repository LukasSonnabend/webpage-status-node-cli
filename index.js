#!/usr/bin/env node

import chalk from "chalk";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import inquirer from "inquirer";
import fs from "fs";
import readline from "readline";
import fetch from "node-fetch";
import { createSpinner } from "nanospinner";
const websiteFile = "websites.csv";
const websites = [];


async function readWebsitesFromFile(websiteFile) {
  try {
    const fileStream = fs.createReadStream(websiteFile)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    for await (const line of rl) {
      websites.push(line)
    }

  } catch (e) {
    console.log(chalk.red(`Could not open ${websiteFile}`))
    fs.writeFileSync(websiteFile, "", { flag: "a" });
  }
}

function checkDuplicate(incomingWebsite) {
  if (websites.includes(incomingWebsite))
    return true
  else
    return false

}



const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));

const welcomePrompt = () => {
  console.log(chalk.red("Uptime Tool v1.0.0"));
};

async function addWebsite() {
  const answers = await inquirer.prompt({
    name: "website_name",
    type: "input",
    message: "Enter the website name:",
  });

  const regString = "^(https?W)//(w{3})(W[A-z]+)(W[a-z]{2,}){1,2}$";
  const validUrl = new RegExp(regString);
  let websiteName = answers.website_name;

  if (!websiteName.includes("www.")) websiteName = `www.${websiteName}`;
  if (!websiteName.includes("http://") && !websiteName.includes("https://"))
    websiteName = `http://${websiteName}`;

  const testResult = /^(https?\W)\/\/(w{3})(\W[A-z]+)(\W[a-z]{2,}){1,2}$/.test(
    websiteName
  );
  if (!testResult) {
    console.log(
      chalk.red(
        "URL seems to be invalid please enter your url like this: 'https://example.com'\n"
      )
    );
    console.log(chalk.yellow(`Interpreted input as: ${websiteName}`));
    return;
  }

  if (checkDuplicate(websiteName)) {
    console.log(chalk.yellow(`⚠️ You already added this website`))  
    return
  }


  console.log(chalk.green("Valid URL entered initial test running now"));

  try {
    const request = await fetch(websiteName);
    const websiteValid = request.status === 200;
    if (websiteValid) {
      fs.writeFileSync(websiteFile, websiteName + "\n", { flag: "a" });
      console.log(
        chalk.green(`Success! Saving ${websiteName} to your websites`)
      );
    } else {
      console.log(chalk.red(`Failed! Got response: ${request.status}`));
    }
  } catch (e) {
    console.log(chalk.red(`Failed! This Website doesn´t seem to exits.\nIf you are absolutly sure it exists check your Internet Connection and try again`));
  }
}

// actual program

await readWebsitesFromFile(websiteFile)
await addWebsite();
