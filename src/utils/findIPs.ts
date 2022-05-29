import os from 'os'

export function findIPs() {
  const networkInterfaces = os.networkInterfaces()
  const concatInfoes = Object.values(networkInterfaces).reduce((a, b) => {
    return a.concat(b)
  }, [])
  return concatInfoes
}

export function findIPV4() {
  return findIPs().filter(info => info.family === 'IPv4')
}

export function findIPV6() {
  return findIPs().filter(info => info.family === 'IPv6')
}
