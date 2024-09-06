const { delay } = require("bluebird");

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

console.log('__filename: ', __filename);
console.log('__dirname: ', __dirname);
console.log(process.cwd());
let configData = fs.readFileSync(path.resolve(process.cwd(), "config.json"), "utf-8");
configData = JSON.parse(configData)
const { executablePath, startId, searchStr, endId } = configData


// https://dynamic.eeo.cn/saasajax/school.ajax.php?action=getOpenCourseMiddlePage
setInterval(() => { }, 1000);
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync(path.join(process.cwd(), 'db.json'));
const db = low(adapter);
db.defaults({ posts: [], date: null }).write();
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();

const todayString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
console.log('todayString: ', todayString);

const existingDate = db.get("date").value() || 0;
if (!existingDate || existingDate !== todayString) {
  db.set("date", todayString).write();
  db.set("posts", []).write();
}

run();

async function getRenderedHTML(page, cid) {
  try {
    const url = `https://share.eeo.cn/s/a/?cid=${cid}`
    console.log('url: ', url);
    await page.goto(url);

    const html = await page.content();
    const courseNameMatch = html.match(/<p class="courseName text-2-lines">(.+?)<\/p>/);
    const courseName = courseNameMatch ? courseNameMatch[1] : null;
    const teacherNameMatch = html.match(/<span class="">\s*([^<]+?)\s*<\/span>/);
    const teacherName = teacherNameMatch ? teacherNameMatch[1] : null;

    console.log(`课程名称：${courseName}`);
    console.log(`教师姓名：${teacherName}`);

    return {
      cid,
      courseName,
      teacherName,
      url
    }
  } catch (error) {
    return false
  }
}
async function createPage() {
  const browser = await puppeteer.launch({
    executablePath,
  });
  const page = await browser.newPage();
  // await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  return { browser, page }
}


async function run() {
  if (!executablePath || !startId || !searchStr || !endId) {
    console.log('config 缺失');
  }

  const { page, browser } = await createPage()

  for (let cid = startId; cid <= endId; cid++) {
    if (checkCidExist(cid)) {
      console.log('使用缓存');
      continue
    }
    const res = await getRenderedHTML(page, cid)
    await dbPushData(res)
    await delay(randomDelay())
  }
  outputResult()
  await browser.close();
  function outputResult() {
    const posts = db.get("posts").value()
    const result = posts.filter(item => item.courseName && item.courseName.includes(searchStr)).map(it => it.url).join('\n')
    console.log('result: ', result);
    const outputPath = path.resolve(process.cwd(), "结果.txt")
    fs.writeFileSync(outputPath, result, "utf-8");
    console.log('执行完毕，文化保存到了', outputPath);
  }
  function dbPushData(data) {
    console.log('data: ', data);
    if (!data) { return }
    if (!data.cid) { return }

    const { cid } = data

    const posts = db.get("posts").value()

    const _f = posts.find(item => item.cid === cid)
    if (!_f) {
      posts.push(data)
      db.write()
    } else {
      console.log(cid, '已存在');
    }
  }
  function checkCidExist(cid) {
    const posts = db.get("posts").value()
    const _f = posts.find(item => item.cid === cid)
    return !!_f
  }
}


function randomDelay(minDelay = 100, maxDelay = 200) {
  return Math.random() * (maxDelay - minDelay) + minDelay
}
