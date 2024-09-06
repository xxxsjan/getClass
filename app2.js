import fetch from "node-fetch";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';
import prompts from 'prompts';
import { chromium } from 'playwright';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);




// https://dynamic.eeo.cn/saasajax/school.ajax.php?action=getOpenCourseMiddlePage

main();
async function main() {
  const response = await prompts({
    type: "text",
    name: "value",
    message: "打包的文件夹名",
  });

  if (!response.value) {
    return;
  }
 
}
setInterval(() => {
  // console.log(Date.now());
}, 1000);

 
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
    .then((data) => {
      console.log("data: ", data);
      return data;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}
// requ(267010735).then((res) => {
//   console.log(res);
// });
function randomDelay(minDelay, maxDelay) {
  return new Promise((resolve) => {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    setTimeout(resolve, delay);
  });
}

async function getRenderedHTML(url) {
  const browser = await chromium.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage();

  await page.goto(url);
  await page.waitForLoadState("networkidle"); // 等待页面完全加载

  const html = await page.content(); // 获取渲染后的 HTML 内容

  await browser.close();

  return html;
}

// getRenderedHTML("https://share.eeo.cn/s/a/?cid=267010735")
//   .then((html) => {
//     console.log(html);
//   })
//   .catch((error) => {
//     console.error(error);
//   });