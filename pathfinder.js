const os = require('os')
var iterations = 100
const mips = 600
const bandwidth = 1000
const cpuNum = 2

const alpha = 2
const beta = 1
const gamma = 4
const rho = 0.05
const visits = 30

function probabilityTable(servers, start, end, preferability, load) {
    var total = 0
    var lbfValues = []
    var cloud = mips*bandwidth*cpuNum
    var freq = []
    var probabilities = []

    //initialize preferability
    for(i=0;i<servers.length;i++) {
        preferability[i] = cloud
    }

    // console.log(preferability)

    for(i=0;i<servers.length;i++) {
        total += load[i]
    }

    for(i=0;i<servers.length;i++) {
        lbfValues[i] = total/load[i]
    }

    total = 0

    for(i=0;i<servers.length;i++) {
        probabilities[i] = Math.pow(preferability[i],alpha)*Math.pow(cloud,beta)*Math.pow(lbfValues[i],gamma);
        total += probabilities[i]
    }

    for(i=0;i<servers.length;i++) {
        probabilities[i] = probabilities[i]/total
    }
    var optServer = 0
    var votes = [0,0,0,0,0]
    var maxVotes = 0
    for(k=0;k<visits;k++){

        var index = vote(servers,probabilities);
        votes[index]++;
    }

    for(i=1;i<servers.length;i++) {
        if (votes[i] > maxVotes) {
            maxVotes = votes[i]
            optServer = i
        }
    }
    load[optServer] = load+1
    preferability[optServer] = preferability[optServer]*(1-rho)+1
    // console.log(probabilities)

    return optServer

}


function vote (servers,probabilities) {

    var sum = 0
    var freq = []

    for(i=0;i<servers.length;i++) {
        freq[i] = (probabilities[i]*100000);
        sum += freq[i];
        
    }
    
    var n = 1 + Math.random()*sum;
    if(n <= freq[0]){
        return 0;
    }
    // console.log("freq", freq,n)
    // console.log(n)

    for(i=0;i<servers.length-1;i++){
        freq[i+1] += freq[i];
        if(n>freq[i] && n<= freq[i+1]){
            // console.log("server", i+1)
            return i+1;
        }
    }
}

function balancer(lastServer) {
    var servers = [0,1,2,3,4]
    var preferability = [1,1,1,1,1]
    var load = [1,1,1,1,1]
    if (lastServer == -1) {
        load[lastServer+1] += 1
    }
    var server = probabilityTable(servers, 0, 1, preferability, load)
    return server
}

module.exports = balancer