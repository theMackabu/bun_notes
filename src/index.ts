import os from "node:os";
import { Hono } from "hono";
import nmd from 'nano-markdown';
import { logger } from 'hono/logger'
import { Database } from "bun:sqlite";
import { customAlphabet } from 'nanoid'
import { basicAuth } from 'hono/basic-auth'
import { serveStatic } from 'hono/serve-static.bun'

const app = new Hono();
const db = new Database("list.sqlite");
const port = parseInt(process.env.PORT) || 3000;
const classes = ['usgov', 'english', 'anatomy', 'business'];
const nanoid = customAlphabet('useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict', 21);
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const initDB = () => {
  classes.map((name: string) => {
    db.run(`CREATE TABLE IF NOT EXISTS ${name} (id TEXT, title TEXT, content TEXT, date TEXT, class TEXT)`);
    console.log(`initialized table ${name}`)
  })

  console.log("db init complete")
}

initDB();
app.use('/static/*', serveStatic({ root: './' }));
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))
app.use('*', logger());
app.use(
  '/notes/*',
  basicAuth({
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  })
)

const getAllClasses = () => {
  const usgov = db.query(`SELECT * FROM usgov`).all();
  const english = db.query(`SELECT * FROM english`).all();
  const anatomy = db.query(`SELECT * FROM anatomy`).all();
  const business = db.query(`SELECT * FROM business`).all();

  return { usgov, english, business, anatomy }
}

app.onError((err, res) => {
  console.error(`${err}`)
  return res.json({ message: 'Internal Error', ok: false, error: err.message }, 500)
})

app.get("/health", (res) => {
  return res.json({
    port: port,
    uptime: `${(os.uptime() / 86400).toFixed(2)}d`,
    message: 'OK',
    timestamp: Date.now().toString(),
    arch: os.arch(),
    freemem: os.freemem(),
    hostname: os.hostname(),
    loadavg: os.loadavg(),
    platform: os.platform(),
    release: os.release(),
    tmpdir: os.tmpdir(),
    totalmem: os.totalmem(),
    type: os.type(),
    userInfo: os.userInfo(),
    version: os.version(),
  });
})

app.get("/api/v1/list", (res) => {
  return res.json(getAllClasses());
})

app.get("/api/v1/list/:className", (res) => {
  const { className } = res.req.param();

  const query = db.query(`SELECT * FROM ${className}`).all();
  return res.json({ db: query });
})

app.post("/api/v1/add", async (res) => {
  const data = await res.req.json<{ title: string, content: string, class: string }>();
  const randomId = nanoid();

  db.exec(`INSERT INTO ${data.class} (id, title, content, date, class) VALUES ($id, $title, $content, $date, $class)`, {
    $id: randomId,
    $title: data.title,
    $content: data.content,
    $date: new Date(Date.now()).toISOString(),
    $class: data.class,
  });

  return res.json({
    id: randomId,
    data: {
      class: data.class,
      title: data.title,
      content: data.content,
      date: new Date(Date.now()).toISOString(),
    },
  });
})

app.post("/api/v1/delete", async (res) => {
  const data = await res.req.json<{ id: string, class: string }>();
  db.query(`DELETE FROM ${data.class} WHERE id = $id`).get({ $id: data.id });

  return res.json({ deleted: data.id, class: data.class });
})

app.get('/notes', (res) => {
  const usgov = db.query(`SELECT * FROM usgov`).all();
  const english = db.query(`SELECT * FROM english`).all();
  const anatomy = db.query(`SELECT * FROM anatomy`).all();
  const business = db.query(`SELECT * FROM business`).all();
  const notes = [].concat(usgov, english, business, anatomy);

  return res.html(`
  <!doctype html>
  <html>
  
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script>
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
    <title>All Notes - ${notes.length} note${notes.length == 1 ? '' : 's'}</title>
  </head>
  
  <body class="overscroll-none">
    <div class="relative flex min-h-screen flex-col overflow-hidden bg-gray-50">
      <img src="/static/beams.jpeg" alt="" class="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        width="1308" />
      <div
        class="absolute inset-0 bg-[url(/static/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]">
      </div>
      <div class="flex items-center justify-center mt-20">
      <h2 class="relative z-50 font-bold leading-7 text-gray-900 text-3xl max-w-3xl grid place-items-center">All Notes</h2>
      </div>
      <div class="flex items-center justify-center">
      <div
      class="relative bg-white shadow ring-1 ring-gray-900/5 sm:rounded-lg m-10 mt-7 max-w-3xl">
      <div>
        <ul role="list" class="divide-y divide-gray-200">
        ${notes.map((data) => {
    const FormattedDate = new Date(data.date);

    return `<li>
          <a href="/notes/${data.class}/${data.id}" class="block hover:bg-gray-50 hover:bg-opacity-70 transition rounded-lg w-[40rem]">
            <div class="px-4 py-4 flex items-center sm:px-6">
              <div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div class="truncate">
                  <div class="flex text-sm">
                    <p class="font-medium text-blue-600 truncate">${data.title}</p>
                    <p class="ml-1 flex-shrink-0 font-normal text-gray-500">in ${data.class} class</p>
                  </div>
                  <div class="mt-2 flex">
                    <div class="flex items-center text-sm text-gray-500">
                      <p>
                      Last updated 
                        <span>${months[FormattedDate.getMonth()]} ${FormattedDate.getDate()}, ${FormattedDate.getFullYear()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <span class="text-xs text-gray-500 font-medium">${(new Blob([data.content]).size / 1000).toFixed(2)}kb</span><span><pre class="ml-2 -mr-2 font-mono text-xs text-gray-400">[${data.id}]</pre></span>
              <div class="ml-5 flex-shrink-0">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </a>
        </li>`}).join('')}
        </ul>
      </div>
      </div>
      </div>
      </div>
    </div>
    </div>
  </body>
  
  </html>`)
})

app.get("/notes/:className/:id", (res) => {
  const { className, id } = res.req.param();
  const query = db.query(`SELECT * FROM ${className} WHERE id = $id`).get({ $id: id });
  const FormattedDate = new Date(query.date);

  return res.html(`
<!doctype html>
<html>

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script>
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <title>${query.title} - ${className.slice(0, 1).toUpperCase()}${className.slice(1)} Notes (${months[FormattedDate.getMonth()]} ${FormattedDate.getDate()}, ${FormattedDate.getFullYear()}})</title>
</head>

<script>
const deleteNote = () => {
  fetch("/api/v1/delete", {
    method: "POST",
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({ class: '${className}', id: '${id}' })
  }).then(() => window.location.href = "/notes")
}
</script>

<body class="overscroll-none">
  <div class="relative flex min-h-screen flex-col overflow-hidden bg-gray-50 grid place-items-center px-10">
    <img src="/static/beams.jpeg" alt="" class="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
      width="1308" />
    <div
      class="absolute inset-0 bg-[url(/static/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]">
    </div>
    <div class="z-50 relative mt-5 -mb-5 max-w-6xl w-full">
    <div>
    <div>
      <nav>
        <a href="/notes" class="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <svg class="flex-shrink-0 -ml-1 mr-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          Back
        </a>
      </nav>
    </div>
    <div class="mt-2 md:flex md:items-center md:justify-between">
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">${query.title} <span class="text-sm font-medium text-gray-600 capitalize">${query.class} notes</span></h2>
        <h3 class="text-xs text-gray-500 font-medium mt-0.5 -mb-2">Last updated ${months[FormattedDate.getMonth()]} ${FormattedDate.getDate()}, ${FormattedDate.getFullYear()}</p>
      </div>
      <div class="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
        <button type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">Share</button>
        <button type="button" onclick="deleteNote()" class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none">Delete</button>
      </div>
    </div>
  </div>
    </div>
    <div
      class="relative bg-white px-7 py-6 shadow ring-1 ring-gray-900/5 sm:rounded-lg m-10 max-w-7xl w-full">
      <div>
        <p>
          <div class="prose">
            ${nmd(query.content)}
          </div>
        </p>
      </div>
    </div>
  </div>
</body>

</html>`)
})

console.log(`running at [::]:${port}`);

export default { port, fetch: app.fetch };
