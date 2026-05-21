// IS A SYSTEM PACKAGE
// ---
// System packages have more capabilities, and use slightly different formatting. These should not be used as a reference.

async function ws() {
  //DESCRIPTION=Sets the workspace
  //USAGE=ws
  try {
    directoryHandle = await window.showDirectoryPicker();
    setPrompt(`/${directoryHandle.name}`);
  } catch { }
}

async function ls() {
  //DESCRIPTION=Lists files in a folder
  //MANUAL=As of now, it only lists the workspace you are currently in
  //USAGE=ls
  if (directoryHandle) {
    let fileList = [];
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'file') {
        fileList.push(await entry.name);
      }
    }
    process(['echo', 'stdout', fileList.join('  ')]);
  } else {
    process(['echo', 'stderr', 'Requires a workspace']);
  }
}

async function touch() {
  //DESCRIPTION=Creates a blank file
  //MANUAL=With a specified name
  //USAGE=touch <name>
  if (directoryHandle) {
    if (args.length !== 0) {
      const name = args.join(' ');
      const fileHandle = await directoryHandle.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.close();
    } else {
      process(['echo', 'stderr', 'Not enough args']);
    }
  } else {
    process(['echo', 'stderr', 'Requires a workspace']);
  }
}

async function cat() {
  //DESCRIPTION=Prints text from a file
  //USAGE=cat <file>
  if (directoryHandle) {
    if (args.length !== 0) {
      const name = args.join(' ');
      const fileHandle = await directoryHandle.getFileHandle(name);
      const file = await fileHandle.getFile();

      process(['echo', 'stdout', await file.text()]);
    } else {
      process(['echo', 'stderr', 'Not enough args']);
    }
  } else {
    process(['echo', 'stderr', 'Requires a workspace']);
  }
}
