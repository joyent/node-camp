var fs = require('fs'),
    join = require('path').join,
    exec = require('child_process').exec;

function syncDir(source, target, pattern) {
  console.log("Watching %s -> %s", source, target);

  fs.readdir(source, function (err, files) {
    if (err) {
      throw err;
    }
    files.forEach(function (file) {
      if (file[0] === '.') {
        return;
      }
      fs.stat(join(source, file), function (err, stat) {
        if (err) {
          throw err;
        }
        if (stat.isDirectory()) {
          syncDir(join(source, file), join(target, file), pattern);
        }
      });
    });
  });

  function saveFile(filename) {
    var command = 'novacom put file://' + join(target, filename) +
                  ' < ' + join(source, filename);
    console.log(command);
    exec(command, function (err, stdout, stderr) {
      if (err) {
        process.stdout.write("ERROR (" + join(target, filename) + "): ");
      }
      process.stdout.write(stderr);
      process.stdout.write(stdout);
    });
  }

  var mtimes = {};

  function saveAll() {
    fs.readdir(source, function (err, files) {
      if (err) {
        throw err;
      }
      files.forEach(function (filename) {
        if (!pattern.test(filename)) {
          return;
        }
        fs.stat(join(source, filename), function (err, stat) {
          if (err) {
            throw err;
          }
          if (!stat.isFile()) {
            return;
          }
          var mtime = stat.mtime.valueOf();
          if (mtimes[filename] === mtime) {
            return;
          }
          mtimes[filename] = mtime;
          saveFile(filename);
        });
      });
    });
  }

  fs.watchFile(source, {interval: 30}, saveAll);
  saveAll();
}

if (process.argv.length < 3) {
  console.log("Usage:");
  console.log("\tnode updater.js source target filter");
  console.log("Example:");
  console.log("\tnode updater.js ./palmbus /tmp '\\.js$'");

} else {
  var source = process.argv[2];
  var target = process.argv[3] || "/tmp";
  var filter = new RegExp(process.argv[4] || "\\.js$");
  syncDir(source, target, filter);
}

