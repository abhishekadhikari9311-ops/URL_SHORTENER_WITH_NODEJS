const fs = require("fs/promises");
const path = require("path");
const http = require("http");


const server = http.createServer(async (req, res) => {
  const serveFile = async (res, filePath, contentType) => {
    try {
      const data = await fs.readFile(filePath);
      res.writeHead(200, {
        "Content-Type": contentType,
      });
      res.end(data);
    } catch (error) {
      console.log(error, "err occured:---");
      res.writeHead(404, {
        "Content-Type": "text/plain",
      });
      res.end("page not found");
    }
  };

  if (req.method === "GET") {
    if (req.url === "/") {
      serveFile(res, path.join("public", "index.html"), "text/html");
    }

    if (req.url === "/style.css") {
      serveFile(res, path.join("public", "style.css"), "text/css");
    }
  }
});

server.listen(8000, () => {
  console.log(`server is running at 8000`);
});
