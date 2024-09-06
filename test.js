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
async function main() {
  getData(267010735)
  // const promises = [];
  // for (let i = startId.value; i <= endId.value; i++) {
  //   promises.push(() => getData(i));
  // }
  // Promise.allSettled(promises).then((results) =>
  //   results.forEach((result) => console.log(result.status)),
  // );
  async function main() {
    // const startId = await prompts({
    //   type: "number",
    //   name: "value",
    //   message: "开始数字",
    //   initial: 267010735,
    // });
    // const endId = await prompts({
    //   type: "number",
    //   name: "value",
    //   message: "开始数字",
    //   initial: 267010736,
    // });
    // if (!startId.value || !endId.value) {
    //   return;
    // }

  }
}

function getData(courseId) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      courseId
    }).toString(),
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
    }).then(res => {
      console.log(res)
    })
}





