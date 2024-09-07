const { delay } = require("bluebird");
const dayjs = require("dayjs");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");
const pc = require('picocolors');

const configFilePath = path.join(process.cwd(), 'config.json')

initConfigFile();
let configData = fs.readFileSync(configFilePath, "utf-8");
configData = JSON.parse(configData)
const { executablePath, startId, searchStr, endId, sleep = 500, refresh = true } = configData

console.log(pc.green(`🚀🚀🚀 执行配置：查询字段：${searchStr} , 查询间隔：${sleep}毫秒`));

// https://dynamic.eeo.cn/saasajax/school.ajax.php?action=getOpenCourseMiddlePage
setInterval(() => { }, 1000);

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync(path.join(process.cwd(), 'cache.json'));
const db = low(adapter);

db.defaults({ posts: [], date: null }).write();

const todayString = dayjs().format("YYYY-MM-DD");
const startTime = Date.now()
function calcSpeed(count) {
  const endTime = Date.now()
  const time = (endTime - startTime) / 1000
  return `速度：${Math.round(count / time, 2)}条/秒`
}
console.time('耗时')
const existingDate = db.get("date").value() || 0;
if ((!existingDate || existingDate !== todayString) && refresh) {
  db.set("date", todayString).write();
  db.set("posts", []).write();
}

run();

async function getRenderedHTML(page, cid) {
  try {
    const url = `https://share.eeo.cn/s/a/?cid=${cid}`
    await page.goto(url);
    const haveData = await page.waitForSelector(".schoolName", { timeout: 2000 })
      .then(() => true)
      .catch(() => false);
    if (!haveData) {
      return {
        cid,
        courseName: null,
        teacherName: null,
        schoolName: '班级链接已经失效',
        url
      }
    }
    const html = await page.content();
    const courseNameMatch = html.match(/<p class="courseName text-2-lines">(.+?)<\/p>/);
    const courseName = courseNameMatch ? courseNameMatch[1] : null;
    const teacherNameMatch = html.match(/<span class="">\s*([^<]+?)\s*<\/span>/);
    const teacherName = teacherNameMatch ? teacherNameMatch[1] : null;

    const schoolNameMatch = html.match(/<p class="schoolName">(.+?)<\/p>/);
    const schoolName = schoolNameMatch ? schoolNameMatch[1] : null;

    // console.log(`课程名称：${courseName}`);
    // console.log(`教师姓名：${teacherName}`);
    // console.log(`schoolName ${schoolName}`);

    return {
      cid,
      courseName,
      teacherName,
      schoolName,
      url
    }
  } catch (error) {
    return false
  }
}
async function createPage() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
  });
  const page = await browser.newPage();
  return { browser, page }
}


async function run() {
  if (!executablePath || !startId || !searchStr || !endId) {
    console.log('config 缺失参数');
    return
  }

  const { page, browser } = await createPage()
  const len = endId - startId + 1
  for (let i = 0; i < len; i++) {
    const cid = startId + i
    const cacheInfo = checkCidExist(cid)
    if (cacheInfo) {
      console.log(`${i + 1}/${len} https://share.eeo.cn/s/a/?cid=${cid} ${cacheInfo.schoolName} ${calcSpeed(i + 1)}`);
      continue
    } else {
      const res = await getRenderedHTML(page, cid)
      console.log(`${i + 1}/${len} https://share.eeo.cn/s/a/?cid=${cid} ${(res && res.courseName) || '班级链接已经失效'} ${calcSpeed(i + 1)}`);
      await dbPushData(res)
      await delay(Number(sleep || 50) + randomDelay())
    }
  }
  console.timeEnd('耗时')
  outputResult()

  await browser.close();
  function outputResult() {
    const posts = db.get("posts").value()
    const result = posts.filter(({ schoolName, courseName
    }) => schoolName !== '班级链接已经失效'
      && (stringContainsIgnoreCase(schoolName, searchStr) || stringContainsIgnoreCase(courseName, searchStr)))

      .map(it => it.url).join('\n')
    console.log('result: ', result);
    const outputPath = path.resolve(process.cwd(), `${searchStr}-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.txt`)
    fs.writeFileSync(outputPath, result, "utf-8");
    console.log(pc.green(`✅✅✅ 执行完毕，文件保存到了 ${outputPath}`));
    console.log(pc.yellow('请手动关闭命令窗口'));
  }
  function dbPushData(data) {
    if (!data) { return }
    if (!data.cid) { return }

    const { cid } = data

    const posts = db.get("posts").value()

    const _f = posts.find(item => item.cid === cid)
    if (!_f) {
      posts.push(data)
      db.write()
    } else {
      // console.log(cid, '已存在');
    }
  }
  function checkCidExist(cid) {
    const posts = db.get("posts").value()
    const _f = posts.find(item => item.cid === cid)
    return _f
  }
}


function randomDelay(minDelay = 10, maxDelay = 30) {
  return Math.random() * (maxDelay - minDelay) + minDelay
}
function stringContainsIgnoreCase(str1, str2) {
  if (!str1 || !str2) {
    return false
  }
  return str1.toLowerCase().includes(str2.toLowerCase());
}

function initConfigFile() {
  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, JSON.stringify({
      "executablePath": "",
      "startId": 267010735,
      "endId": 267010736,
      "searchStr": "",
      "sleep": 1000
    }, null, 2), 'utf-8');
  }
}