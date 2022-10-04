import { Hono } from "hono";
import { api } from '@/routes';
import { db } from '@/database';
import { logger } from 'hono/logger';
import { list, view } from '@/views';
import { classes, port } from '@/config';
import { basicAuth } from 'hono/basic-auth';
import { serveStatic } from 'hono/serve-static.bun';

const app = new Hono();

app.use('/static/*', serveStatic({ root: './' }));
app.use('*', logger());
app.use('/notes/*', basicAuth({
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
}));

app.route('/api/v1', api);
app.route('/notes', list);
app.route('/notes', view);

app.notFound((res) => res.json({ message: 'Not Found', ok: false }, 404));
app.onError((err, res) => {
    console.error(`${err}`);
    return res.json({ message: 'Internal Error', ok: false, error: err.message }, 500);
})

db.initialize(classes).then(() => { console.log(`running at [::]:${port}`); });

export default { port, fetch: app.fetch };