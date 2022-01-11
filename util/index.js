const fs = require("fs/promises")
const showdown  = require('showdown')

function removeExt(filename) {
    return filename.split('.md')[0]
}

function unSlugfy(filename) {
    return removeExt(filename.replace(/-|_/g, ' '))
}

function slugfy (str) {
    str = str.replace(/^\s+|\s+$/g, '');
    str = str.toLowerCase();
  
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    return str;
}

function getTableOfContents(text) {
    let headerMatch = /^#+(.*)$/;
    let lines = text.split("\n");
    lines = lines.filter(function (line) {
        return line.length > 0;
    });
    if (lines.length === 0) {
        throw new Error("no content");
    }

    return lines.map(line => {
        let title = line.match(headerMatch) && line.match(headerMatch)[1]
        return title !== null && slugfy(title)
    }).filter(Boolean)
}

async function readFiles(dirname) {
    let filenames = await fs.readdir(dirname)
    const files = []

    converter = new showdown.Converter(),
   
    await Promise.all(filenames.map(async function(filename) {
        const file = await fs.readFile(dirname + '/' + filename, 'utf-8')
        files.push({ 
            [unSlugfy(filename)]: {
              'content':  converter.makeHtml(file),
              'table_of_contents': getTableOfContents(file)
            }
        })
    }));

    filenames = filenames.map(unSlugfy)

    return { filenames, files, main: files[0][filenames[0]] }
}

module.exports = function getDocuments(dirname) {
    return readFiles(dirname)
}