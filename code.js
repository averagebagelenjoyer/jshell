const input = document.getElementById('input');
const logContainer = document.getElementById('log-container');
const hostname = 'jshell';
const startup = Date.now();
const promptElm = document.getElementById('prompt');
let history = [];
let historyIndex = -1;
let directoryHandle;
let cmdPrompt;

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


let packages = {
  hardcode: {
    help: {
      description: 'Shows all commands',
      run: args => {
        for (const [command, info] of Object.entries(commands())) {
          print(`${command} - ${info.description || 'Unknown'}`);
        }
      }
    },
    echo: {
      description: 'Echoes a string',
      run: args => {
        print(args.join(' '));
      }
    },
    aptget: {
      description: 'Downloads a given package',
      run: async args => {
        const package = args.join(' ');

        print('Checking...');

        const result = await fetch(`https://averagebagelenjoyer.github.io/jshell/repo/${package}.js`);

        if (!result.ok) {
          print('\x1b[31mPackage not found');
          return;
        }

        print('Found!');
        print('Downloading...');

        await load(await result.text(), package);

        print('Finished!');
      }
    },
    aptunget: {
      description: 'Deletes a given package',
      run: args => {
        const package = args.join(' ');

        if (PROTECTED_PACKAGES.includes(package)) {
          print(`'${package}' is a protected package`, 'error');
          return;
        }

        if (packages.includes(package)) {
          delete packages.package;
          print(`Successfully deleted '${package}'`);
        } else {
          print('\x1b[31mPackage not found');
        }
      }
    },
  }
}

const commands = () => { return { ...Object.assign({}, ...Object.values(packages)) }; };

async function load(package, name, system = false) {
  if (PROTECTED_PACKAGES.includes(name) && !system) {
    return;
  }
  const functions = package.match(/^(async )?function.*?\n}/gms);

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
onmessage = (args) => {
  (${func.replace(/[\\`$]/g, '\\$&')})();
};
\`], { type: 'application/javascript' });

  const worker = new Worker(URL.createObjectURL(blob));

  worker.onmessage = (event) => {
    process(event.data);
    console.log(event.data);
  };

  worker.postMessage(args);
};
`);
  }
}

(async () => {
  const result = await fetch('https://averagebagelenjoyer.github.io/jshell/repo/core.js');
  const code = await result.text();
  load(code, 'core', true);
})();

async function process(raw) {
  const [command, ...args] = raw;

  if (command) {
    if (commands().hasOwnProperty(command)) {
      commands()[command].run(args);
    } else {
      print(`\x1b[31mUnrecognized command '${command}'`);
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

    print(`${cmdPrompt}${input.value}`);

    try {
    process(input.value.match(/'([^']*)'|[^\s']+/g)
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
