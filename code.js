const input = document.getElementById('input');
const logContainer = document.getElementById('log-container');
const hostname = 'jshell';
const startup = Date.now();
const promptElm = document.getElementById('prompt');
let history = [];
let historyIndex = -1;
let directoryHandle;
let cmdPrompt;

input.focus();

function setPrompt(directory = '/', user = 'user') {
  cmdPrompt = `user@${hostname}:~${directory}$ `;
  promptElm.innerText = cmdPrompt;
}

setPrompt();

function print(text, type = 'default', raw = false) {
  const log = document.createElement('div');
  if (raw) {
    log.innerHTML = text;
  } else {
    log.innerText = text;
  }
  log.classList.add(`log`);
  log.classList.add(`log-${type}`);
  logContainer.appendChild(log);

  window.scrollTo({
    top: document.body.scrollHeight
  });
}

print(`Run 'help' for more help,`);
print(`Run 'ws' to set the workspace,`);
print(`And run 'neofetch' because it's awesome.`);
print(` `)
print(`... or do 'apt-get cowsay' for [a liter version of] cowsay`);
print(` `)

let commands = {
  /* =========================================== */
  /* ==============[ random shit ]============== */
  /* =========================================== */
  clear: {
    description: 'Clears the screen',
    run: args => { logContainer.innerHTML = '' }
  },
  neofetch: {
    description: 'Displays system info',
    run: args => {
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
  },
  help: {
    description: 'Shows all commands',
    run: args => {
      for (const [command, info] of Object.entries(commands)) {
        print(`${command} - ${info.description || 'Unknown'}`);
      }
    }
  },
  exec: {
    description: 'Executes inline Javascript',
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
  },
  echo: {
    description: 'Echoes a string',
    run: args => {
      print(args.join(' '));
    }
  },
  randomtestingcommand: {
    run: args => {
      print(args);
    }
  },
  /* ===================================== */
  /* ==============[ utils ]============== */
  /* ===================================== */
  uptime: {
    description: 'Returns the uptime (in seconds)',
    run: args => {
      print(`${(Date.now() - startup) / 1000} seconds`);
    }
  },
  ping: {
    description: 'Pings a website',
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
  },
  /* ========================================== */
  /* ==============[ filesystem ]============== */
  /* ========================================== */
  ws: {
    description: 'Sets the workspace',
    run: async args => {
      try {
        directoryHandle = await window.showDirectoryPicker();
        setPrompt(`/${directoryHandle.name}`);
      } catch { }
    }
  },
  ls: {
    description: 'Lists files in a folder',
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
  },
  touch: {
    description: 'Creates a blank file',
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
  },
  cat: {
    description: 'Lists files in a folder',
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
  },
  /* =============================================== */
  /* ==============[ package manager ]============== */
  /* =============================================== */
  'apt-get': {
    description: "Downloads a given package",
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
  },
};

let package = []

async function load(package, name) {
  const config = JSON5.parse(await package.text());
  //const name = package.match(/([^/]+?)(?:\.[^.]+)?$/)[1];

  commands[name] = {};
  commands[name].description = config.description;
  commands[name].run = eval(config.run);
};

async function process(raw) {
  const [command, ...args] = raw.match(/"([^"]*)"|[^\s"]+/g)
    .map(t => t.replace(/^"|"$/g, ""));

  input.value = ''
  print(`${cmdPrompt}${raw}`);

  if (command) {
    if (commands[command]) {
      commands[command].run(args);
    } else {
      print(`Unrecognized command '${command}'`, 'error');;
    }
  }
}

document.addEventListener('mouseup', () => {
  input.focus();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    history.push(input.value);
    historyIndex = history.length;
    process(input.value);
  }

  if (event.key === 'ArrowUp') {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = history[historyIndex];
    }
    event.preventDefault();
  }

  if (event.key === 'ArrowDown') {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      input.value = history[historyIndex];
    } else {
      historyIndex = history.length;
      input.value = '';
    }
    event.preventDefault();
  }

  if (event.key === 'Tab') {
    event.preventDefault();

    const text = input.value;
    const matches = Object.keys(commands).filter(name =>
      name.startsWith(text)
    );

    if (matches.length === 1) {
      input.value = matches[0];
    }
  }
});
