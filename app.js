const express = require('express');
const app = express();
const path = require('path');

// src
const bx = require('./modules/bx.js');
const bfx = require('./modules/bitfinex.js');
const coinbase = require('./modules/coinbase.js');
const cex = require('./modules/cex.js');
const bittrex = require('./modules/bittrex.js');
const binance = require('./modules/binance.js');
const coinmarketcap = require('./modules/coinmarketcap.js');
const util = require('./modules/utils.js');
const _ = require('lodash');

let onlineUser = 0;
let bxCache = [];
let bfxCache = [];
let coinbaseCache = [];
let cexCache = [];
let bittrexCache = [];
let binanceCache = [];
let coinMarketCapCache = [];

let isBxFetched = false;
let isBfxFetched = false;
let isCoinbaseFetched = false;
let isCexFetched = false;
let isBittrexFetched = false;
let isBinanceFetched = false;
let isCoinMarketCapFetched = false;

const configMsg = {
  שלום רב לכם - וברוכים הבאים לדף השוואת  מחירי מטבעות דיגיטךיים של פבלו התותח

global.schema = {
  name: null,
  last_price: null,
  last_price_usd: null,
  currency: null,
  change: null,
  volume: null
}

const server = app.listen(process.env.PORT || 3000, function() {
  console.log('Listening... :3000');
});

// socket
const io = require('socket.io').listen(server);

function updateOnlineUser(oper) {
  if (oper === '+') {
    onlineUser++;
  } else {
    onlineUser--;
  }
  
  console.log(onlineUser + ' users online');
  io.emit('online', onlineUser);
}

function welcomeMsg(socket) {
  socket.emit('notification', configMsg.donate);
}

function sendCache() {
  if (isBxFetched) {
    // console.log('send bx cache');
    io.emit('bx', bxCache);        
  }

  if (isBfxFetched) {
    // console.log('send bfx cache');
    io.emit('bfx', bfxCache);        
  }

  if (isCoinbaseFetched) {
    io.emit('coinbase', coinbaseCache);        
  }

  if (isCexFetched) {
    io.emit('cex', cexCache);        
  }

  if (isBittrexFetched) {
    io.emit('bittrex', bittrexCache);        
  }

  if (isBinanceFetched) {
    io.emit('binance', binanceCache);        
  }

  if (isCoinMarketCapFetched) {
    io.emit('coinmarketcap', coinMarketCapCache);        
  }
}

util.getCurrency('usd', 'thb', function(value) { 
  console.log('1 USD = ' + value + ' THB')
  global.THB = value;
  bx.fetch(function(data) {
    isBxFetched = true;
    bxCache = data;
  });
  
  bfx.fetch(function(data) {
    isBfxFetched = true;
    bfxCache = data;
  });

  // coinbase.fetch(function(data) {
  //   isCoinbaseFetched = true;
  //   coinbaseCache = data;
  // });

  cex.fetch(function(data) {
    isCexFetched = true;
    cexCache = data;
  });

  bittrex.fetch(function(data) {
    isBittrexFetched = true;
    bittrexCache = data;
  });

  binance.fetch(function(data) {
    isBinanceFetched = true;
    binanceCache = data;
  });

  coinmarketcap.fetch(function(data) {
    isCoinMarketCapFetched = true;
    coinMarketCapCache = data;
  });
})

io.on('connection', function(socket) {
  sendCache();
  updateOnlineUser('+');
  welcomeMsg(socket);

  socket.on('disconnect', function() {
    updateOnlineUser('-');
  });

  socket.on('boardcast', function(msg) {
    io.emit('notification', msg);
  })
});

setInterval(function(){
  util.getCurrency('usd', 'thb', function(value) { 
    console.log('1 USD = ' + value + ' THB')
    global.THB = value;
  })
}, 600000);

setInterval(function(){
  bx.fetch(function(data) {
    bxCache = data;
    io.emit('bx', data);
  });

  bfx.fetch(function(data) {
    bfxCache = data;
    io.emit('bfx', data);
  });

  // coinbase.fetch(function(data) {
  //   coinbaseCache = data;
  //   io.emit('coinbase', data);  
  // });

  cex.fetch(function(data) {
    cexCache = data;
    io.emit('cex', data);
  });

  bittrex.fetch(function(data) {
    bittrexCache = data;
    io.emit('bittrex', data);
  });

  binance.fetch(function(data) {
    binanceCache = data;
    io.emit('binance', data);
  });

  coinmarketcap.fetch(function(data) {
    coinMarketCapCache = data;
    io.emit('coinmarketcap', data);
  });
}, 20000);

// Auto notification
setInterval(function(){
  welcomeMsg()
}, 10800000);
 
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
 
app.get('/', function(req, res) {
    res.render('index');
});
