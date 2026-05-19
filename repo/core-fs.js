// System Package

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
      postMessage(['echo', fileList.join('  ')]);
    } else {
      postMessage(['echo', 'Requires a workspace', 'error']);
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
        postMessage(['echo', 'Not enough args', 'error']);
      }
    } else {
      postMessage(['echo', 'Requires a workspace', 'error']);
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

        postMessage(['echo', await file.text()]);
      } else {
        postMessage(['echo', 'Not enough args', 'error']);
      }
    } else {
      postMessage(['echo', 'Requires a workspace', 'error']);
    }
  }
}
