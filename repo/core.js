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
      process(['echo', 'stdout', result]);
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

function canvas(args) {
  [name, ...args] = args;

  const canvasWindow = window.open('', 'canvasWindow');

  canvasWindow.document.write(`
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>canvas</title>

  <link rel="icon" type="image/png" href="./favicons/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="./favicons/favicon.svg" />
  <link rel="shortcut icon" href="./favicons/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="./favicons/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-title" content="JShell" />
  <link rel="manifest" href="./favicons/site.webmanifest" />
</head>

<body>
  <canvas id="canvas" width="100%" height="100%">Your browser does not support canvas.</canvas>
</body>

</html>
`);

  const canvas = canvasWindow.document.getElementById('canvas');
  const context = canvas.getContext('2d');

  console.log(context)

  if (name === 'fillStyle') {
    context.fillStyle = args.join(' ')
  } else {
    const func = context[name];
    if (typeof func === "function") {
      func.apply(context, args.map(arg => Number.isFinite(Number(arg)) ? Number(arg) : arg));
    }
  }
}
