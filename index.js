#!/usr/bin/env node

import { addWebsite, checkWebsites, readWebsitesFromFile, welcomePrompt} from "./functions.js"

const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));


await welcomePrompt();
const websites = await readWebsitesFromFile();
console.log(websites)
await checkWebsites(websites);

//await addWebsite();
