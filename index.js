const express = require('express')
const request = require('request')
const body = require('body-parser');
const balancer = require('./pathfinder')

const servers = [express(),express(),express(),express()]
let cur = 0
var lastServer = -1


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
    cur = balancer(lastServer)
    console.log(cur)
    req.pipe(request({ url: `http://localhost:${3000+cur}` + req.url })).pipe(res);
    res.send(`Hello from server ${3000+cur}!`);
    lastServer = cur
    // setTimeout(() => { res.send(`Hello from server ${3000+cur}!`); }, 500);
}

mainServer.use(profilerMiddleware).get("/", serverHandler).post("/", serverHandler)
mainServer.listen(8000, () => console.log(`listening on port ${8000}`))