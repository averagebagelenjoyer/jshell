// IS A SYSTEM PACKAGE
// ---
// System packages have more capabilities, and use slightly different formatting. These should not be used as a reference.

function clear(args) {
  //DESCRIPTION=Clears the screen
  process(['echo', 'stdout', '\x1b[c']);
}

function neofetch(args) {
  //DESCRIPTION=Displays system info
  process(['echo', 'stdout', /*pad*/   `              user@${hostname}`]);
  process(['echo', 'stdout', String.raw`    ___       -----`]);
  process(['echo', 'stdout', String.raw`   |\  \      OS: ${navigator.userAgentData.platform || 'Unknown'}`]);
  process(['echo', 'stdout', String.raw`   \ \  \     Shell: JShell`]);
  process(['echo', 'stdout', String.raw` __ \ \  \    User Agent: ${navigator.userAgent}`]);
  process(['echo', 'stdout', String.raw`|\  \\_\  \   Resolution: ${window.innerWidth}x${window.innerHeight}`]);
  process(['echo', 'stdout', String.raw`\ \________\  CPU: ${navigator.hardwareConcurrency} cores`]);
  process(['echo', 'stdout', String.raw` \|________|  Color Depth: ${screen.colorDepth}`]);
  process(['echo', 'stdout', String.raw`              Memory: ${navigator.deviceMemory} GB`]);
  process(['echo', 'stdout', /*pad*/   `              \x1b[31m██\x1b[32m██\x1b[33m██\x1b[34m██\x1b[35m██\x1b[36m██\x1b[37m██`]);
}

async function exec(args) {
  //DESCRIPTION=Executes inline Javascript
  if (args.length !== 0) {
    const code = args.join(' ');

    try {
      const result = await eval(code);
      process(['echo', 'stdout',  result]);
    } catch (error) {
      process(['echo', 'stderr', `${error}`]);
    }
  } else {
    process(['echo', 'stderr', 'Not enough args']);
  }
}

function exit(args) {
  //DESCRIPTION=Exits the shell
  window.close();
}

function uptime(args) {
  //DESCRIPTION=Returns the uptime (in seconds)
  process(['echo', 'stdout', `${(Date.now() - startup) / 1000} seconds`]);
}
