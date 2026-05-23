// IS A SYSTEM PACKAGE
// ---
// System packages have more capabilities, and use slightly different formatting. These should not be used as a reference.

async function aptget(args) {
  //DESCRIPTION=Downloads a given package
  //MANUAL=Currently only allows the official repository at the moment, this can be overridden by a variable in the source code
  //USAGE=aptget <package>
  const pkg = args.join(' ');

  process(['echo', 'stdout', 'Checking...']);

  const result = await fetch(`${REPOSITORY_PATH}/${pkg}.js`);

  if (!result.ok) {
    process(['echo', 'stderr', 'Package not found']);
    return;
  }

  process(['echo', 'stdout', 'Found!']);
  process(['echo', 'stdout', 'Downloading...']);

  await load(await result.text(), pkg);

  process(['echo', 'stdout', 'Finished!']);
}

function aptunget(args) {
  //DESCRIPTION=Deletes a given package
  //USAGE=aptunget <package>
  const pkg = args.join(' ');

  if (PROTECTED_PACKAGES.includes(pkg)) {
    process(['echo', 'stderr', `'${pkg}' is a protected package`]);
    return;
  }

  if (pkg in packages) {
    delete packages[pkg];
    process(['echo', 'stdout', `Successfully deleted '${pkg}'`]);
  } else {
    process(['echo', 'stderr', 'Package not found']);
  }
}

function aptlist(args) {
  //DESCRIPTION=Lists all installed pacakges
  //USAGE=aptlist

  process(['echo', 'stdout', Object.keys(commands()).join(', ')]);
}
