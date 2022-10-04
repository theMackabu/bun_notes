import { db } from '@/database';
import { html } from 'hono/html';
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict', 21);
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getCominedRows = (tables: Array<string>) => {
    let rows = [];
    tables.map((name) => {
        const query = db.client.query(`SELECT * FROM ${name}`).all();
        rows.push({ table: name, data: query });
    })

    return rows;
}

interface SiteData {
    title: string
    children?: any
}

const siteLayout = (props: SiteData) => html`<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script>
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
      <title>${props.title}</title>
    </head>
    <body>
      ${props.children}
    </body>
  </html>`

export { getCominedRows, nanoid, months, siteLayout };