var ip = require('ip')
var os = require('os')
var net = require('net')
var cp = require('mz/child_process')

var parseLinux = require('./parser/linux')
var parseWin32 = require('./parser/win32')
var parseRow = require('./parser')

var lock = {}
const N_SERVERS_PER_BATCH =10000;
const TEN_MEGA_BYTE = 1024 * 1024 * 10
const ONE_MINUTE = 60 * 1000
const options = {
  maxBuffer: TEN_MEGA_BYTE,
  timeout: ONE_MINUTE
}
/**
 * Finds all local devices (ip and mac address) connectd to the current network.
 */
module.exports = function findLocalDevices (address) {
  var key = String(address)
  lock[key] =
    lock[key] ||
    (address
      ? new Promise((resolve, reject)=>{
			pingServer(address).then((address)=>{
				arpOne(address, getServers()).then((res)=>{
					resolve(res);
				}).catch(reject);
			}).catch(reject);
		})
      : pingAndArbServersInChunks()
    ).then(unlock(key))
  return lock[key]
}

/**
 * Gets the current list of possible servers in the local networks.
 */
function getServers () {
  var interfaces = os.networkInterfaces()
  var result = []

  for (var key in interfaces) {
    var addresses = interfaces[key]
    for (var i = addresses.length; i--;) {
      var address = addresses[i]
      if (address.family === 'IPv4' && !address.internal) {
        var subnet = ip.subnet(address.address, address.netmask)
        var current = ip.toLong(subnet.firstAddress)
        var last = ip.toLong(subnet.lastAddress) - 1
        while (current++ < last) result.push(ip.fromLong(current))
      }
    }
  }

  return result
}

/**
 * Sends a ping to all servers to update the arp table.
 */
function pingAndArbServersInChunks() {
	return new Promise((resolve, reject)=>{
		const servers = getServers();//gets the latest servers each time the method is called. not once upon the first run like previously.
		//If this is being used within a much bigger piece of software it might run for many days.
		const serverss=[];
		var index=0;
		while(index<servers.length){
			serverss.push(servers.slice(index, N_SERVERS_PER_BATCH));
			index+=N_SERVERS_PER_BATCH;
		}
		var index=0;
		const arpResultss=[];
		nextServersChunk();
		function nextServersChunk(){
			if(index>=serverss.length){
				resolve(filterUniqueArbResults(arpResultss));
				return;
			}
			const serversChunk = serverss[index++];
			Promise.all(serversChunk.map(pingServer)).then(()=>{
				arpAll(servers).then((arpResults)=>{
					arpResultss.push(arpResults);
					nextServersChunk();
				}).catch(reject);
			});
		}
	});
}
function filterUniqueArbResults(arpResultss) { 
	var seenIps={};
	var filtered=[];
	arpResultss.forEach((arpResults)=>{ 
		arpResults.forEach((arpResult)=>{
			if(seenIps[arpResult.ip])return;
			filtered.push(arpResult);
			seenIps[arpResult.ip]=true;
		});
	});
	return filtered;
}

/**
 * Pings and individual server to update the arp table.
 */
function pingServer (address) {
  return new Promise(function (resolve) {
    var socket = new net.Socket();
    socket.setTimeout(1000, close);
    socket.connect(80, address, close);
    socket.once('error', close);
    function close (err) {
      socket.destroy();
      resolve(address);
    }
  })
}

/**
 * Reads the arp table.
 */
function arpAll (servers) {
	return new Promise((resolve, reject)=>{
		cp.exec('arp -a', options).then((data)=>{
			const arpResults = parseAll(data, servers);
			resolve(arpResults);
		}).catch(reject);
	});
}

/**
 * Parses arp scan data into a useable collection.
 */
function parseAll (data, servers) {
  if (!data || !data[0]) {
    return []
  }
  if (process.platform.includes('linux')) {
    var rows = data[0].split('\n');
    return rows.map(function (row) {
      return parseLinux(row, servers);
    }).filter(Boolean);
  }
  if(process.platform.includes('win32')) {
    var rows = data[0].split('\n');
    return rows.map(function (row) {
	  return parseWin32(row, servers);
    }).filter(Boolean);
  }
  return data[0]
    .trim()
    .split('\n')
    .map(function (row) {
      return parseRow(row, servers)
    })
    .filter(Boolean)
}

/**
 * Reads the arp table for a single address.
 */
function arpOne (address, servers) {
	if (!ip.isV4Format(address) && !ip.isV6Format(address)) {
		return Promise.reject(new Error('Invalid IP address provided.'))
	}
	return new Promise((resolve, reject)=>{
		cp.exec('arp -a ' + address, options).then((data)=>{
			resolve(parseOne(data, servers));
		}).catch((err)=>{resolve(null);});
	});
}

/**
 * Parses a single row of arp data.
 */
function parseOne (data, servers) {
  if (!data || !data[0]) {
    return
  }

  if (process.platform.includes('linux')) {
    // ignore unresolved hosts (can happen when parseOne returns only one unresolved host)
    if (data[0].indexOf('no entry') >= 0) {
      return
    }

    // remove first row (containing "headlines")
    var rows = data[0].split('\n').slice(1)[0]
    return parseLinux(rows, servers, true)
  }
  if (process.platform.includes('win32')) {
    var rows = data[0].split('\n').slice(1);
	var index=0;
	while(index<rows.length){
		var arp = parseWin32(rows[index++], servers);
		if(arp)return arp;
	}
  }
  return parseRow(data[0], servers)
}

/**
 * Clears the current promise and unlocks (will ping servers again).
 */
function unlock (key) {
  return function (data) {
    lock[key] = null
    return data
  }
}
