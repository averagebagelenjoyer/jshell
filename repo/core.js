function clear(arg) {
  //DESCRIPTION=Clears the screen
  logContainer.innerHTML = '';
}

function neofetch(arg) {
  //DESCRIPTION=Displays system info
  print( /*pad*/  `              user@${hostname}`);
  print(String.raw`    ___       -----`);
  print(String.raw`   |\  \      OS: ${navigator.userAgentData.platform || 'Unknown'}`);
  print(String.raw`   \ \  \     Shell: JShell`);
  print(String.raw` __ \ \  \    User Agent: ${navigator.userAgent}`);
  print(String.raw`|\  \\_\  \   Resolution: ${window.innerWidth}x${window.innerHeight}`);
  print(String.raw`\ \________\  CPU: ${navigator.hardwareConcurrency} cores`);
  print(String.raw` \|________|  Color Depth: ${screen.colorDepth}`);
  print(String.raw`              Memory: ${navigator.deviceMemory} GB`);
  print( /*pad*/  `              \
<span style='color:red'>██</span>\
<span style='color:green'>██</span>\
<span style='color:yellow'>██</span>\
<span style='color:blue'>██</span>\
<span style='color:magenta'>██</span>\
<span style='color:cyan'>██</span>\
<span style='color:white'>██</span>`, 'default', true)
}

function help(args) {
  //DESCRIPTION=Shows all commands
  for (const [command, info] of Object.entries(fullCommands())) {
    print(`${command} - ${info.description || 'Unknown'}`);
  }
}


function exec(args) {
  //DESCRIPTION=Executes inline Javascript
  run: async args => {
    if (args.length !== 0) {
      const code = args.join(' ');

      try {
        const result = await eval(code);
        print(result);
      } catch (error) {
        print(error, 'error');
      }
    } else {
      print('Not enough args', 'error');
    }
  }
}

function echo(args) {
  //DESCRIPTION=Echoes a string
  run: args => {
    print(args.join(' '));
  }
}

function exit(args) {
  //DESCRIPTION=Exits the shell
  run: args => {
    window.close();
  }
}

function uptime(args) {
  //DESCRIPTION=Returns the uptime (in seconds)
  run: args => {
    print(`${(Date.now() - startup) / 1000} seconds`);
  }
}

function ping(args) {
  //DESCRIPTION=Pings a website
  run: async args => {
    if (args.length !== 0) {
      let url = args.join(' ');
      url = /^(https?|ftp|wss?):\/\//i.test(url) ? url : 'https://' + url;

      print('pinging...');

      try {
        await fetch(url, { method: 'GET', mode: 'no-cors' });
        print('online');
      } catch (e) {
        print('offline');
      }
    } else {
      print('Not enough args', 'error');
    }
  }
}

function ws(args) {
  //DESCRIPTION=Sets the workspace
  run: async args => {
    try {
      directoryHandle = await window.showDirectoryPicker();
      setPrompt(`/${directoryHandle.name}`);
    } catch { }
  }
}

function ls(args) {
  //DESCRIPTION=Lists files in a folder
  run: async args => {
    if (directoryHandle) {
      let fileList = [];
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {
          fileList.push(await entry.name);
        }
      }
      print(fileList.join('  '));
    } else {
      print('Requires a workspace', 'error');
    }
  }
}

function touch(args) {
  //DESCRIPTION=Creates a blank file
  run: async args => {
    if (directoryHandle) {
      if (args.length !== 0) {
        const name = args.join(' ');
        const fileHandle = await directoryHandle.getFileHandle(name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.close();
      } else {
        print('Not enough args', 'error');
      }
    } else {
      print('Requires a workspace', 'error');
    }
  }
}

function cat(args) {
  //DESCRIPTION=Lists files in a folder
  run: async args => {
    if (directoryHandle) {
      if (args.length !== 0) {
        const name = args.join(' ');
        const fileHandle = await directoryHandle.getFileHandle(name);
        const file = await fileHandle.getFile();

        print(await file.text());
      } else {
        print('Not enough args', 'error');
      }
    } else {
      print('Requires a workspace', 'error');
    }
  }
}

function aptget(args) {
  //DESCRIPTION=Downloads a given package
  run: async args => {
    const package = args.join(' ');

    print('Checking...');

    const result = await fetch(`https://averagebagelenjoyer.github.io/jshell/repo/${package}.json5`);

    if (!result.ok) {
      print('Package not found', 'error');
      return;
    }

    print('Found!');
    print('Downloading...');

    await load(result, package);

    print('Finished!');
  }
}

function aptunget(args) {
  //DESCRIPTION=Deletes a given package
  run: async args => {
    const package = args.join(' ');

    if (Reflect.deleteProperty(packages, package)) {
      print(`Successfully deleted '${package}'`);
    } else {
      print('Package not found', 'error');
    }
  }
}
