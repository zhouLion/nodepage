import { writeFile } from "fs";
import got from "got";

const url = "xxx";

got.get(url, {
  headers: {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "zh-CN,zh;q=0.9",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "upgrade-insecure-requests": "1",
    "cookie": "HRX-WEB-SESSION=S4eea716a9ae14a1c91a74e4de91885b90; CAS_SSO_COOKIE=9e90f84670b096290170ce51e8ed004e-01a70857ac8842d6910f8e95fad1f734; JSESSIONID=B80666AC25453DF675699CD33283CD4E; ws_auth=19afa4e|177994|m99jnWJVnaUBcyb16JUK73s09usCIF9YpCf0c1YkA1dNCpiph5_WzuHaA_R9LzFR; PASESSION=4jKOEh0o1SOKC6-GATfpia7TQ5DbjJec93!Rq12rBqoCzTnIiIUdfpFCbIdWse3Nk!vLtcgjF7uRaCS30CNUA367fWWBxWxRsyJkM0Av9h88FY8BlLGAhZvSeIrhHiEqI3xxCkY8k-thkLnR5tf5zw==|TOwCM00wMyAxOjAyMSoyMTowOQ=="
  },
  method: "GET",
})
  .buffer()
  .then((buffer) => {
    writeFile("./xx.zip", buffer, console.log);
  });