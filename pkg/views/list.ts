import { Hono } from "hono";
import { html } from 'hono/html';
import { classes } from '@/config';
import { months, getCominedRows, siteLayout } from '@/helpers';

const client = new Hono()

const notesList = (notes: Array<any>) => {
   return notes.map((data) => {
      const FormattedDate = new Date(data.date);

      return html`<li>
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
              <span class="text-xs text-gray-500 font-medium">${(new Blob([data.content]).size / 1000).toFixed(2)}kb</span>
              <span>
                 <pre class="ml-2 -mr-2 font-mono text-xs text-gray-400">[${data.id}]</pre>
              </span>
              <div class="ml-5 flex-shrink-0">
                 <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                 </svg>
              </div>
           </div>
        </a>
     </li>`})
}

const pageBody = (notes: Array<any>) => html`
<body class= "overscroll-none">
   <div class="relative flex min-h-screen flex-col overflow-hidden bg-gray-50">
      <img src="/static/beams.jpeg"  class="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2" width="1308" />
      <div class="absolute inset-0 bg-[url(/static/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div class="flex items-center justify-center mt-20">
         <h2 class="relative z-50 font-bold leading-7 text-gray-900 text-3xl max-w-3xl grid place-items-center">All Notes</h2>
      </div>
      <div class="flex items-center justify-center" >
         <div class="relative bg-white shadow ring-1 ring-gray-900/5 sm:rounded-lg m-10 mt-7 max-w-3xl">
            <div>
               <ul role="list" class="divide-y divide-gray-200">
                  ${notesList(notes)}
               </ul>
            </div>
         </div>
      </div>
   </div>
   </div>
   </div>`

client.get('/', (res) => {
   const notes = getCominedRows(classes).map(item => item.data).flat()
   return res.html(siteLayout({ title: `All Notes - ${notes.length} note${notes.length == 1 ? '' : 's'}`, children: pageBody(notes) }))
})

export default client;