const http = require("http");
const fs = require("fs");
const { measureMemory } = require("vm")
const host = "localhost";
const port = 3601;

const requestListener = (request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Powered-By", "Node.js");

    const { method, url } = request;

    if(url === "/farmers") {
        if(method === "GET") {
            response.statusCode = 200;
            fs.readFile("./data.json", (err, data) => {
                let { farmers } = JSON.parse(data);
                response.end(
                    JSON.stringify({
                        status: "succes",
                        message: "Retrived farmers",
                        data: farmers,
                    }));
            })
        } else if (method === "POST") {
            const timeNow = Date.now();
            let body = [];

            request.on("data", (chunk) => {
                body.push(chunk);
            });

            request.on("end", () => {
                body = Buffer.concat(body).toString();
                const reqData = JSON.parse(body);
                response.statusCode = 200;
                const farmer = {
                    id: `farmer-${timeNow}`,
                    name: reqData.name,
                    loc: reqData.loc,
                }

                fs.readFile("./data.json", (err, data) => {
                    data = JSON.parse(data);
                    data.farmers.push(farmer);
                    fs.writeFile('./data.json', JSON.stringify(data), 'utf-8', (err) => {
                        if (err) {
                            console.log(`Failed to write to File: ${err}`);
                        }
                    });
                    response.end(
                        JSON.stringify({
                            status: "success",
                            message: `Add farmer success`,
                        })
                    );
                })
                
            });
        } else {
            response.statusCode = 400;
            response.end(
                JSON.stringify({
                    status: "fail",
                    message: `You are not allowed to access this endpoint`,
                })
            );
        } 
    }
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server berjalan pada http://${host}:${port}`);
});