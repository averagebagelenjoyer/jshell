// IS A SYSTEM PACKAGE
// ---
// system packages use `process` instead of `postMessage`, have more capabilities, and should not be used as a reference

function ws() {
  //DESCRIPTION=Sets the workspace
  try {
    directoryHandle = await window.showDirectoryPicker();
    setPrompt(`/${directoryHandle.name}`);
  } catch { }
}

function ls() {
  //DESCRIPTION=Lists files in a folder
  run: async args => {
    if (directoryHandle) {
      let fileList = [];
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {
          fileList.push(await entry.name);
        }
      }
      process(['echo', fileList.join('  ')]);
    } else {
      process(['echo', 'Requires a workspace', 'error']);
    }
  }
}

function touch() {
  //DESCRIPTION=Creates a blank file
  run: async args => {
    if (directoryHandle) {
      if (args.length !== 0) {
        const name = args.join(' ');
        const fileHandle = await directoryHandle.getFileHandle(name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.close();
      } else {
        process(['echo', 'Not enough args', 'error']);
      }
    } else {
      process(['echo', 'Requires a workspace', 'error']);
    }
  }
}

function cat() {
  //DESCRIPTION=Lists files in a folder
  run: async args => {
    if (directoryHandle) {
      if (args.length !== 0) {
        const name = args.join(' ');
        const fileHandle = await directoryHandle.getFileHandle(name);
        const file = await fileHandle.getFile();

        process(['echo', await file.text()]);
      } else {
        process(['echo', 'Not enough args', 'error']);
      }
    } else {
      process(['echo', 'Requires a workspace', 'error']);
    }
  }
}
