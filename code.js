const input = document.getElementById('input');
const logContainer = document.getElementById('log-container');
const hostname = 'jshell';
const startup = Date.now();
const promptElm = document.getElementById('prompt');
let history = [];
let historyIndex = -1;
let directoryHandle;
let cmdPrompt;
let screenBuffer = '';
let promptHidden = false;
let breakWithC = true;

const ANSI = {
  0: 'reset',
  1: 'font-weight:bold',
  30: 'color:black',
  31: 'color:red',
  32: 'color:green',
  33: 'color:yellow',
  34: 'color:blue',
  35: 'color:magenta',
  36: 'color:cyan',
  37: 'color:white',
  90: 'color:gray',
  91: 'color:lightcoral',
  92: 'color:lightgreen',
  93: 'color:lightyellow',
  94: 'color:lightskyblue',
  95: 'color:violet',
  96: 'color:lightcyan',
  97: 'color:white'
};

const PROTECTED_PACKAGES = ['hardcode', 'core', 'core-fs'];
const DANGEROUS_COMMANDS = ['exit', 'exec', 'cat', 'ls', 'touch', 'ws', 'aptget', 'aptunget'];

input.focus();

function setPrompt(directoryOrPrompt = '/', userOrRaw = 'user') {
  cmdPrompt = userOrRaw === true ? directoryHandle : `user@${hostname}:~${directoryOrPrompt}$ `;
  promptElm.innerText = cmdPrompt;
}

setPrompt();

function print(text) {
  const log = document.createElement('div');

  text = text.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

  text = text.replace(/\x1b\[(\d+(?:;\d+)*)m/g, (_, codes) => {
    const styles = codes
      .split(';')
      .map(c => ANSI[c])
      .filter(Boolean);

    if (styles.length) {
      open = true;
      return `<span style="${styles.join(';')}">`;
    }
  });

  const clearRegex = /.*\x1b\[c/;

  if (clearRegex.test(text)) {
    text = text.replace(clearRegex, '');

    logContainer.innerHTML = '';
  }

  log.innerHTML = text;
  log.classList.add(`log`);
  logContainer.appendChild(log);

  window.scrollTo({
    top: document.body.scrollHeight
  });
}

function flushBuffer() {
  for (const line of screenBuffer.split('\n')) {
    print(line);
  }

  screenBuffer = '';
}

let packages = {
  hardcode: {
    echo: {
      description: 'Echoes a string',
      run: args => {
        screenBuffer += `${args.join(' ')}\n`;
      }
    },
    argtest: {
      run: args => {
        print(args.join(','));
      }
    },
    help: {
      description: 'Shows all commands',
      run: args => {
        for (const [command, info] of Object.entries(commands())) {
          print(`${command} - ${info.description || 'Unknown'}`);
        }
      }
    },
    hide: {
      description: "Hides the prompt until shown with 'show'. Specify '-c' to disallow breaking out via Ctrl+C",
      run: args => {
        if (args.includes("-c")) {
          breakWithC = false;
        } else {
          breakWithC = true;
        }

        promptElm.hidden = true;
        input.hidden = true;
        promptHidden = true;
      }
    },
    show: {
      description: "Shows the prompt if hidden",
      run: args => {
        promptElm.hidden = false;
        input.hidden = false;
        promptHidden = false;

        input.focus();
      }
    },
    wait: {
      description: "Waits a specified amount of time in milliseconds",
      run: async args => {
        const duration = args[0];

        if (Number.isFinite(Number(duration))) {
          await new Promise(resolve => setTimeout(resolve, duration));
        }
      }
    },
    aptget: {
      description: 'Downloads a given package',
      run: async args => {
        const pkg = args.join(' ');

        print('Checking...');

        const result = await fetch(`https://averagebagelenjoyer.github.io/jshell/repo/${pkg}.js`);

        if (!result.ok) {
          print('\x1b[31mPackage not found');
          return;
        }

        print('Found!');
        print('Downloading...');

        await load(await result.text(), pkg);

        print('Finished!');
      }
    },
    aptunget: {
      description: 'Deletes a given package',
      run: args => {
        const pkg = args.join(' ');

        if (PROTECTED_PACKAGES.includes(pkg)) {
          print(`'${pkg}' is a protected package`, 'error');
          return;
        }

        if (pkg in packages) {
          delete packages[pkg];
          print(`Successfully deleted '${pkg}'`);
        } else {
          print('\x1b[31mPackage not found');
        }
      }
    },
  }
}

const commands = () => { return { ...Object.assign({}, ...Object.values(packages)) }; };

async function load(pkg, name, system = false) {
  if (PROTECTED_PACKAGES.includes(name) && !system) {
    return;
  }
  const functions = pkg.match(/^(async )?function.*?\n}/gms);

  packages[name] = {};

  for (const func of functions) {
    const funcName = func.match(/(?<=^async function |^function )([a-zA-Z0-9]+)/)[0];
    const description = func.match(/^ *\/\/DESCRIPTION=(.*)/m);

    packages[name][funcName] = {};
    if (description) {
      packages[name][funcName].description = description[1];
    }
    packages[name][funcName].run = eval(system ? `(${func})` : `
(args) => {
  const blob = new Blob([\`
onmessage = (event) => {
  const args = event.data;
  (${func.replace(/[\\`$]/g, '\\$&')})();
  console.log('Goodbye webworker, you will be missed 🫡');
  self.close();
};
\`], { type: 'application/javascript' });

  const worker = new Worker(URL.createObjectURL(blob));

  worker.onmessage = (event) => {
    const [command, ...args] = event.data;
    
    if (!DANGEROUS_COMMANDS.includes(command)) {
      process([command, ...args]);
    }
  };

  worker.postMessage(args);
};
`);
  }
}

(async () => {
  for (const pkg of ['core', 'core-fs']) {
    const code = await (await fetch(`https://averagebagelenjoyer.github.io/jshell/repo/${pkg}.js`)).text();
    load(code, pkg, true);
  }
})();

function splitList(list, delimiter) {
  const out = [[]];
  for (const item of list) {
    item === delimiter ? out.push([]) : out[out.length - 1].push(item);
  }
  return out;
}

async function process(raw) {
  for (const rawCommand of splitList(raw, ';')) {
    const [command, ...args] = rawCommand;

    if (command) {
      if (commands().hasOwnProperty(command)) {
        await commands()[command].run(args);
      } else {
        print(`\x1b[31mUnrecognized command '${command}'`);
      }
    }

    flushBuffer();
  }
}

document.addEventListener('mouseup', () => {
  input.focus();
});

document.addEventListener('keydown', (event) => {
  if (promptHidden) {
    if (breakWithC) {
      if (event.ctrlKey && event.key === "c") {
        process(['show']);
      }
    }
    return;
  }

  if (event.key === 'Enter') {
    history.push(input.value);
    historyIndex = history.length;

    print(`${cmdPrompt}${input.value}`);

    try {
      process(input.value.match(/'[^']*'|;|[^\s';]+/g) // absolute shit
        .map(t => t.replace(/^'|'$/g, '')));
    } catch {

    }

    input.value = '';
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
    const matches = Object.keys(commands()).filter(name =>
      name.startsWith(text)
    );

    if (matches.length === 1) {
      input.value = matches[0];
    }
  }
});
