// run `node index.js` in the terminal

//console.log(`Hello Node.js v${process.versions.node}!`);
console.log("Updating html file with tlemon component ...")

var fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      fs.readFile(dirname + filename, 'utf-8', function(err, content) {
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
      let contentChanged = false;
      let newContent = data[filename] = content;
      const inputTags = content.match(/<input type="text" .*>/g) || [];
      for (const tag of inputTags) {
        const dom = new JSDOM(tag);
        const input = dom.window.document.querySelector("input");
        if (input.getAttribute("type") === "text") {
          const attributeNames = input.getAttributeNames();
          const attributeItems = attributeNames.reduce((acc, name) => {
            const value = input.getAttribute(name);
            if (value !== '') {
              acc.push(`${name}="${value}"`);
            } else {
                acc.push(`${name}`)
            }
            return acc;
          }, []);
          const newTag = `<t-input ${attributeItems.join(" ")}></t-input>`;
          if (newTag !== tag) {
            newContent = newContent.replace(tag, newTag);
            contentChanged = true;
          }
        }
      }
      if (contentChanged) {
        fs.writeFile("html/" + filename, newContent, function (err) {
          if (err) throw err;
          console.log(`File "${filename}" updated.`);
        });
      } else {
        console.log(`File "${filename}" unchanged.`);
      }
    },
    function (err) {
      console.log(err);
      throw err;
    }
  );