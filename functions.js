import fs from "fs";
import chalk from "chalk";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import inquirer from "inquirer";
import readline from "readline";
import fetch from "node-fetch";
import { createSpinner } from "nanospinner";
import { Worker } from "worker_threads";

const websiteFile = "websites.csv";
const websites = [];

export const readWebsitesFromFile = async () => {
  try {
    const fileStream = fs.createReadStream(websiteFile);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      websites.push(line);
    }
  } catch (e) {
    console.log(chalk.red(`Could not open ${websiteFile}`));
    fs.writeFileSync(websiteFile, "", { flag: "a" });
  }
  return websites;
};

const checkDuplicate = (incomingWebsite) => {
  if (websites.includes(incomingWebsite)) return true;
  else return false;
};

export const welcomePrompt = () => {
  console.log(chalk.red("Uptime Tool v1.0.0"));
};

export const addWebsite = async () => {
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
    console.log(chalk.yellow(`⚠️ You already added this website`));
    return;
  }

  console.log(chalk.green("Valid URL entered initial test running now"));

  try {
    await checkWebsite(websiteName);
  } catch (e) {
    console.log(
      chalk.red(
        `Failed! This Website doesn´t seem to exits.\nIf you are absolutly sure it exists check your Internet Connection and try again`
      )
    );
  }
};

export const checkWebsite = async (websiteName) => {
  const request = await fetch(websiteName);
  const websiteValid = request.status === 200;
  if (websiteValid) {
    fs.writeFileSync(websiteFile, websiteName + "\n", { flag: "a" });
    console.log(chalk.green(`Success! Saving ${websiteName} to your websites`));
  } else {
    console.log(chalk.red(`Failed! Got response: ${request.status}`));
  }
};


export const checkWebsites = async (websitesArray) => {
for (let i = 0; i < websitesArray.length; i++) {
  console.log("checking websites")
  const worker = new Worker("./worker.cjs", { workerData: { website: websites[i] } });
  //Listen for a message from worker
  worker.once("message", (result) => {
    console.log(`result: ${result ? "success" : "fail"}`);
  });
  worker.on("error", (error) => {
    console.log(error);
  });

  worker.on("exit", (exitCode) => {
    console.log(exitCode);
  });

  console.log("Executed in the parent thread");
}
} 