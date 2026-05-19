function cowsay() {
  //DESCRIPTION=srsly why--
  const text = args.join(' ');
  postMessage(['echo', String.raw` ${'_'.repeat(text.length + 2)}`]);
  postMessage(['echo', String.raw`< ${text} >`]);
  postMessage(['echo', String.raw` ${'-'.repeat(text.length + 2)}`]);
  postMessage(['echo', String.raw`        \   ^__^`]);
  postMessage(['echo', String.raw`         \  (oo)\_______`]);
  postMessage(['echo', String.raw`            (__)\       )\/\ `]);
  postMessage(['echo', String.raw`                ||----w |`]);
  postMessage(['echo', String.raw`                ||     ||`]);
};
