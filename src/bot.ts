import { Login, LemmyHttp } from 'lemmy-js-client';
import { exit } from 'process';
import { readFile } from 'fs';

readFile("config.json", async (err, data) => {
    if (err || !data) {
        console.error("Failed to load config.json")
        console.error("Make sure it is located in the directory you execute the bot from")
        exit(1);
    }

    let config = JSON.parse(data.toString());

    let baseUrl = config.instance;
    let client: LemmyHttp = new LemmyHttp(baseUrl);
    let form: Login = {
        username_or_email: config.username,
        password: config.password
    };

    let jwt;
    try {
        jwt = await client.login(form)
    } catch {
        console.error(`Account ${config.username} doesn't exist on that instance yet.`);
        console.error("Please register an account with that name on that instance before trying again");
        exit(1);
    }

    config.instances.forEach(async (instance) => {
        let page = 0;

        while (true) {
            let communities = (await client.listCommunities({
                auth: jwt.jwt,
                page: page,
            })).communities;

            if (communities.length === 0) {
                break;
            }

            console.log(communities);

            page += 1;
        }


    });
});
