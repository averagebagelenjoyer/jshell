function cowsay() {
  //DESCRIPTION=srsly why--
  const text = args.join(' ');
  postMessage(['echo', 'stdout', String.raw` ${'_'.repeat(text.length + 2)}`]);
  postMessage(['echo', 'stdout', String.raw`< ${text} >`]);
  postMessage(['echo', 'stdout', String.raw` ${'-'.repeat(text.length + 2)}`]);
  postMessage(['echo', 'stdout', String.raw`        \   ^__^`]);
  postMessage(['echo', 'stdout', String.raw`         \  (oo)\_______`]);
  postMessage(['echo', 'stdout', String.raw`            (__)\       )\/\ `]);
  postMessage(['echo', 'stdout', String.raw`                ||----w |`]);
  postMessage(['echo', 'stdout', String.raw`                ||     ||`]);
};
