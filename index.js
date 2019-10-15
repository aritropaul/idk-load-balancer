const express = require('express')
const request = require('request')
const body = require('body-parser');

const servers = [express(),express(),express(),express()]
let cur = 0


const handler = serverNum => (req,res) => {
    console.log(`server ${serverNum}`, req.method, req.url, req.body);
    // setTimeout(() => { res.send(`Hello from server ${serverNum}!`); }, 10000);
    res.send(`Hello from server ${serverNum}!`)
}


// Only handle GET and POST requests
for (i = 0; i<servers.length; i++) {
    servers[i].use(body.json());
    servers[i].get("*", handler(i+1)).post("*", handler(i+1))
    servers[i].listen(3000+i)
}

const mainServer = express();

const profilerMiddleware = (req, res, next) => {
    const start = new Date().getTime()
    res.on('finish', () => {
      console.log('Completed', req.method, req.url, new Date().getTime() - start);
    });
    next();
  };

const serverHandler = (req,res) => {
    req.pipe(request({ url: `http://localhost:${3000+cur}` + req.url })).pipe(res);
    res.send(`Hello from server ${3000+cur}!`);
    // setTimeout(() => { res.send(`Hello from server ${3000+cur}!`); }, 500);
    cur = (cur + 1) % servers.length;
}

const plotHandler = (req,res) => {

}

mainServer.use(profilerMiddleware).get("/", serverHandler).post("/", serverHandler).get("/plot", plotHandler)
mainServer.listen(8000, () => console.log(`listening on port ${8000}`))