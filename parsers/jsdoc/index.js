var Q = require('q');
var glob = require("glob");
var fs = require('fs-extra');
var jsdocParse = require("jsdoc-parse");
var marked = require('meta-marked');

function parse(dirname) {

    console.log("Parsing with JsDoc files: " + dirname);

    return Q.Promise(function(resolve, reject, notify) {

        var compounds = [];

        // Markdown files
        var mdFilepaths = glob.sync("*.md", {
            cwd: dirname,
            realpath: true
        });

        mdFilepaths.forEach(function(filepath){

            var filename = filepath.substr(filepath.lastIndexOf('/') + 1);

            var data = fs.readFileSync(filepath, 'utf8');

            var content = marked(data);

            compounds.push({
                slug: filename,
                parser: 'marked',
                kind: 'page',
                summary: {
                    name: filename,
                    meta: content.meta
                },
                body: {
                    name: filename,
                    html: content.html
                }
            });


        });

        // Javascript files
        var jsFilepaths = glob.sync("**/*.js", {
            cwd: dirname,
            realpath: true
        });

        var data = '';

        jsdocParse({
            src: jsFilepaths
        }).on('data', function(chunk) {
            data += chunk;
        }).on('end', function() {
            var parsedData = JSON.parse(data);
            for (var i = 0; i < parsedData.length; i++) {
                var body = parsedData[i];
                parsedData[i] = {
                    slug: body.name,
                    parser: 'jsdoc',
                    kind: body.kind,
                    summary: {
                        name: body.name
                    },
                    body: body
                }
            }
            resolve(compounds.concat(parsedData));
        });

    });

}

module.exports = {
    parse: parse
};
