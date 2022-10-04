import { Database } from "bun:sqlite";

const client = new Database("list.sqlite");
const initialize = async (classes: Array<string>) => {
    classes.map((name: string) => {
        client.run(`CREATE TABLE IF NOT EXISTS ${name} (id TEXT, title TEXT, content TEXT, date TEXT, class TEXT)`);
        console.log(`initialized table ${name}`)
    })

    console.log("db init complete")
}

export const db = {
    initialize,
    client,
};
