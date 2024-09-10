// run `node index.js` in the terminal
console.log("Updating html file with tlemon component ...");

var fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function (filename) {
      fs.readFile(dirname + filename, "utf-8", function (err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}

var data = {};
readFiles(
  "html/",
  function (filename, content) {
    const inputTags = content.match(/<input .*>/g) || [];
    const newContent = inputTags.reduce((content, tag) => {
      const dom = new JSDOM(tag);
      const input = dom.window.document.querySelector("input");
      const attributeNames = input.getAttributeNames();
      const attributeItems = attributeNames.map((name) => {
        const value = input.getAttribute(name);
        return value !== "" ? `${name}="${value}"` : name;
      });
      const newTag =
        input.getAttribute("type") === "text"
          ? `<t-input ${attributeItems.join(" ")}></t-input>`
          : `<t-input-password ${attributeItems.join(" ")}></t-input-password>`;
      return content.replace(tag, newTag);
    }, content);

    return fs.promises
      .writeFile("html/" + filename, newContent)
      .then(() => {
        console.log(`File "${filename}" updated.`);
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  },
  function (err) {
    console.log(err);
    throw err;
  }
);
