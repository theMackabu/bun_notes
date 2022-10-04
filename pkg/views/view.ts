import { Hono } from "hono";
import nmd from 'nano-markdown';
import { db } from '@/database';
import { html } from 'hono/html';
import { months, siteLayout } from '@/helpers';

const client = new Hono()

const convertedMarkdown = (content: string) => {
  return html(nmd(content))
}

const pageBody = (query: any, FormattedDate: any) => html`
<script>
const deleteNote = () => {
  fetch("/api/v1/delete", {
    method: "POST",
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({ class: '${query.class}', id: '${query.id}' })
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
            ${convertedMarkdown(query.content)}
          </div>
        </p>
      </div>
    </div>
  </div>
</body>

</html>`

client.get('/:className/:id', (res) => {
  const { className, id } = res.req.param();
  const query = db.client.query(`SELECT * FROM ${className} WHERE id = $id`).get({ $id: id });

  return res.html(siteLayout({ title: `${query.title} - ${className.slice(0, 1).toUpperCase()}${className.slice(1)} Notes (${months[new Date(query.date).getMonth()]} ${new Date(query.date).getDate()}, ${new Date(query.date).getFullYear()}})`, children: pageBody(query, new Date(query.date)) }))
})

export default client;