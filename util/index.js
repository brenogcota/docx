const fs = require("fs/promises")
const showdown  = require('showdown')

function compare(a, b, prop = 'order') {
    if ( a[prop] < b[prop] ){
      return -1;
    }
    if ( a[prop] > b[prop] ){
      return 1;
    }
    return 0;
}

function sort(filenames, files) {
    const items = filenames.map((item, index) => ({
        order: files[index][item] ? files[index][item].order : 0,
        item
    }))

    let sorted = items.sort(compare)
    return sorted.map(({ item }) => item)
}

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

function getOrder(str){
    let matcher = /<p class=\"order d-none\">(.*?)<\/p>/
    return Number(str.match(matcher) && str.match(matcher)[1])
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
    let files = []

    converter = new showdown.Converter(),
   
    await Promise.all(filenames.map(async function(filename) {
        const file = await fs.readFile(dirname + '/' + filename, 'utf-8')
        files.push({ 
            [unSlugfy(filename)]: {
              'content':  converter.makeHtml(file),
              'table_of_contents': getTableOfContents(file),
              'order': getOrder(file)
            }
        })
    }));

    filenames = sort(filenames.map(unSlugfy), files)

    return { filenames, files, main: files[0][filenames[0]] }
}

module.exports.docs = async function(dirname, current = '') {
    current = unSlugfy(current)
    let { filenames, files, main } = await readFiles(dirname)
    let file = files.find(item => item[current] !== undefined)
    let index = filenames.findIndex(item => item == current)
    let next = filenames[index+1]
    let prev = filenames[index-1]

    if(!!current && file) main = file[current]

    return { filenames, files, main, ...{ next, prev } }
}