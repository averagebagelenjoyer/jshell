function clear(args) {
  //DESCRIPTION=Clears the screen
  postMessage(['echo', 'clear'])
}

function neofetch(args) {
  //DESCRIPTION=Displays system info
  postMessage(['echo', /*pad*/   `              user@${hostname}`]);
  postMessage(['echo', String.raw`    ___       -----`]);
  postMessage(['echo', String.raw`   |\  \      OS: ${navigator.userAgentData.platform || 'Unknown'}`]);
  postMessage(['echo', String.raw`   \ \  \     Shell: JShell`]);
  postMessage(['echo', String.raw` __ \ \  \    User Agent: ${navigator.userAgent}`]);
  postMessage(['echo', String.raw`|\  \\_\  \   Resolution: ${window.innerWidth}x${window.innerHeight}`]);
  postMessage(['echo', String.raw`\ \________\  CPU: ${navigator.hardwareConcurrency} cores`]);
  postMessage(['echo', String.raw` \|________|  Color Depth: ${screen.colorDepth}`]);
  postMessage(['echo', String.raw`              Memory: ${navigator.deviceMemory} GB`]);
  postMessage(['echo', /*pad*/   `              \x1b[31m██\x1b[32m██\x1b[33m██\x1b[34m██\x1b[35m██\x1b[36m██\x1b[37m██`])
}

function help(args) {
  //DESCRIPTION=Shows all commands
  for (const [command, info] of Object.entries(fullCommands())) {
    postMessage(['echo', `${command} - ${info.description || 'Unknown'}`]);
  }
}


async function exec(args) {
  //DESCRIPTION=Executes inline Javascript
  if (args.length !== 0) {
    const code = args.join(' ');

    try {
      const result = await eval(code);
      postMessage(['echo', result]);
    } catch (error) {
      postMessage(['echo', error, 'error']);
    }
  } else {
    postMessage(['echo', 'Not enough args', 'error']);
  }
}

function exit(args) {
  //DESCRIPTION=Exits the shell
  window.close();
}

function uptime(args) {
  //DESCRIPTION=Returns the uptime (in seconds)
  postMessage(['echo', `${(Date.now() - startup) / 1000} seconds`]);
}
