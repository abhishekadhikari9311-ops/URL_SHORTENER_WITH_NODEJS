const fs = require("fs/promises");
const path = require("path");
const http = require("http");
const crypto = require("crypto");

let DATA_FILE = path.join(__dirname, "links.JSON");

let loadLinks = async () => {
  try {
    let data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    throw error;
  }
};

let saveLinks = async (links) => {
  try {
    let data = JSON.stringify(links, null, 5);
    let data1 = await fs.writeFile(DATA_FILE, data);
    return data1;
  } catch (error) {
    console.log(error, "err occured");
  }
};

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
      return serveFile(
        res,
        path.join(__dirname, "public", "index.html"),
        "text/html",
      );
    }

    if (req.url === "/style.css") {
      return serveFile(
        res,
        path.join(__dirname, "public", "style.css"),
        "text/css",
      );
    }
    if (req.url === "/links") {
      let links = await loadLinks();
      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      return res.end(JSON.stringify(links));
    }
    let links = await loadLinks();
    let shortCode = req.url.slice(1);
    if (links[shortCode]) {
      res.writeHead(302, {
        location: links[shortCode],
      });
      return res.end();
    }
    res.writeHead(404, {
      "Content-Type": "text/plain",
    });
    return res.end("shortcode doesnot exists");
  }
  if (req.method === "POST" && req.url === "/shorten") {
    let links = await loadLinks();
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", async () => {
      // console.log(data, "data:");
      let dataObj = JSON.parse(data);
      // console.log("data:---", dataObj);
      let { url, shortCode } = dataObj;

      if (!url) {
        res.writeHead(404, { "Content-Type": "text/html" });
        return res.end("<h1>please provide the valid url</h1>");
      }

      let finalShortCode = shortCode || crypto.randomBytes(6).toString("hex");
      // console.log("finalshortcode:", finalShortCode);

      if (links[finalShortCode]) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("short code already exists....please choose another");
      }

      links[finalShortCode] = url;

      await saveLinks(links);

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify({ success: true, shortCode: finalShortCode }));
    });
  }
});

server.listen(8000, () => {
  console.log(`server is running at 8000`);
});
