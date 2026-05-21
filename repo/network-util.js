async function ping() {
  //DESCRIPTION=Pings a website
  //USAGE=ping <domain>
  if (args.length !== 0) {
    let url = args.join(' ');
    url = /^(https?|ftp|wss?):\/\//i.test(url) ? url : 'https://' + url;

    postMessage(['echo', 'stdout', 'pinging...']);

    try {
      await fetch(url, { method: 'GET', mode: 'no-cors' });
      print('online');
    } catch (e) {
      print('offline');
    }
  } else {
    postMessage(['echo', 'stderr', 'Not enough args']);
  }
}

//> ping example.com
//PING example.com (172.66.147.243): 56 data bytes
//64 bytes from 172.66.147.243: seq=0 ttl=53 time=24.486 ms
//64 bytes from 172.66.147.243: seq=1 ttl=53 time=18.232 ms
//64 bytes from 172.66.147.243: seq=2 ttl=53 time=18.995 ms
//64 bytes from 172.66.147.243: seq=3 ttl=53 time=19.639 ms
//64 bytes from 172.66.147.243: seq=4 ttl=53 time=19.231 ms
//^C
//--- example.com ping statistics ---
//5 packets transmitted, 5 packets received, 0% packet loss
//round-trip min/avg/max = 18.232/20.116/24.486 ms
