import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { promises as fs } from "fs";
import prompts from "prompts";
import { chromium } from "playwright";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://dynamic.eeo.cn/saasajax/school.ajax.php?action=getOpenCourseMiddlePage

main();
setInterval(() => {}, 1000);
async function main() {
  const startId = await prompts({
    type: "number",
    name: "value",
    message: "开始数字",
  });
  const endId = await prompts({
    type: "number",
    name: "value",
    message: "开始数字",
  });
  if (!startId.value || !endId.value) {
    return;
  }
  const promises = [];
  for (let i = startId.value; i <= endId.value; i++) {
    promises.push(() => requ(i));
  }
  Promise.allSettled(promises).then((results) =>
    results.forEach((result) => console.log(result.status)),
  );
}

function requ(courseId) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ courseId }).toString(),
  };

  return fetch(
    `https://dynamic.eeo.cn/saasajax/school.ajax.php?action=getOpenCourseMiddlePage`,
    options
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
}

function randomDelay(minDelay, maxDelay) {
  return new Promise((resolve) => {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    setTimeout(resolve, delay);
  });
}

async function runPromiseQueue(promiseQueue) {
  const results = [];
  const errors = [];

  for (const promise of promiseQueue) {
    try {
      const result = await promise.catch(err=>err);
      results.push(result);
    } catch (error) {
      console.log('error: ', error);
      errors.push(error);
    }
  }

  return { results, errors };
}

// 示例：
const promiseQueue = [
  new Promise((resolve) => {
    setTimeout(() => {
      console.log(Date.now());
      resolve('Promise 1')
    }, 4000)
  }),
  new Promise((resolve) => {
    setTimeout(() => {
      console.log(Date.now());
      resolve('Promise 2')
    }, 2000)
  }),
  new Promise((resolve, reject) => setTimeout(() => reject('Promise 3 Error'), 2000)),
];

runPromiseQueue(promiseQueue)
  .then(() => console.log('All promises completed!'))
  .catch((error) => console.error('Error occurred:', error));


  // async function fn(){
  //  const res = await new Promise((resolve, reject) => setTimeout(() => reject('Promise 3 Error'), 2000)).catch(err=>err)
  //  console.log('res: ', res);
  // }
  // fn()
