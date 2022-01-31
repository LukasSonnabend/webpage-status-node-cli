const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const {parentPort, workerData} = require("worker_threads");

parentPort.postMessage(await checkWebsite(workerData.website))

const checkWebsite = async (websiteName) => {
  const request = await fetch(websiteName);
  return request.status === 200;
};


//https://livecodestream.dev/post/how-to-work-with-worker-threads-in-nodejs/