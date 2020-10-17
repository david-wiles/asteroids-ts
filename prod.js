const fs = require("fs");

(() => {
  let html = fs.readFileSync("www/asteroids.html").toString();
  let js = fs.readFileSync("dist/asteroids.js").toString();

  // Replace js file link with inline JavaScript
  let replacement = html.replace("<script src=\"/static/js/asteroids.js\"></script>\n", "<script>" + js + "</script>");

  fs.writeFileSync("www/asteroids.html", replacement);
})();
