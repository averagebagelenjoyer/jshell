// IS A SYSTEM PACKAGE
// ---
// System packages have more capabilities, and use slightly different formatting. These should not be used as a reference.

function clear(args) {
  //DESCRIPTION=Clears the screen
  process(['echo', '\x1b[c']);
}

function neofetch(args) {
  //DESCRIPTION=Displays system info
  process(['echo', /*pad*/   `              user@${hostname}`]);
  process(['echo', String.raw`    ___       -----`]);
  process(['echo', String.raw`   |\  \      OS: ${navigator.userAgentData.platform || 'Unknown'}`]);
  process(['echo', String.raw`   \ \  \     Shell: JShell`]);
  process(['echo', String.raw` __ \ \  \    User Agent: ${navigator.userAgent}`]);
  process(['echo', String.raw`|\  \\_\  \   Resolution: ${window.innerWidth}x${window.innerHeight}`]);
  process(['echo', String.raw`\ \________\  CPU: ${navigator.hardwareConcurrency} cores`]);
  process(['echo', String.raw` \|________|  Color Depth: ${screen.colorDepth}`]);
  process(['echo', String.raw`              Memory: ${navigator.deviceMemory} GB`]);
  process(['echo', /*pad*/   `              \x1b[31m██\x1b[32m██\x1b[33m██\x1b[34m██\x1b[35m██\x1b[36m██\x1b[37m██`]);
}

async function exec(args) {
  //DESCRIPTION=Executes inline Javascript
  if (args.length !== 0) {
    const code = args.join(' ');

    try {
      const result = await eval(code);
      process(['echo', result]);
    } catch (error) {
      process(['echo', `\x1b[31m${error}`]);
    }
  } else {
    process(['echo', '\x1b[31mNot enough args']);
  }
}

function exit(args) {
  //DESCRIPTION=Exits the shell
  window.close();
}

function uptime(args) {
  //DESCRIPTION=Returns the uptime (in seconds)
  process(['echo', `${(Date.now() - startup) / 1000} seconds`]);
}
