import { Hono } from "hono";
import * as os from "node:os";
import { db } from '@/database';
import { classes, port } from '@/config';
import { getCominedRows, nanoid } from '@/helpers';

const api = new Hono()

api.get("/list", (res) => {
    return res.json(getCominedRows(classes));
});

api.get("/list/:className", (res) => {
    const { className } = res.req.param();

    const query = db.client.query(`SELECT * FROM ${className}`).all();
    return res.json({ [className]: query });
});

api.post("/add", async (res) => {
    const data = await res.req.json<{ title: string, content: string, class: string }>();
    const randomId = nanoid();

    db.client.exec(`INSERT INTO ${data.class} (id, title, content, date, class) VALUES ($id, $title, $content, $date, $class)`, {
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
});

api.post("/delete", async (res) => {
    const data = await res.req.json<{ id: string, class: string }>();
    db.client.query(`DELETE FROM ${data.class} WHERE id = $id`).get({ $id: data.id });

    return res.json({ deleted: data.id, class: data.class });
});

api.get("/health", (res) => {
    return res.json({
        port: port,
        uptime: `${(os.uptime() / 86400).toFixed(2)}d`,
        status: 'online',
        classes: classes,
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
});

export { api };