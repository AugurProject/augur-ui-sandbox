'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _topicFactory = require('./topicFactory');

var _topicFactory2 = _interopRequireDefault(_topicFactory);

var _uport = require('uport');

var _mobileDetect = require('mobile-detect');

var _mobileDetect2 = _interopRequireDefault(_mobileDetect);

var _uportSubprovider = require('./uportSubprovider');

var _uportSubprovider2 = _interopRequireDefault(_uportSubprovider);

var _httpprovider = require('web3/lib/web3/httpprovider');

var _httpprovider2 = _interopRequireDefault(_httpprovider);

var _mnid = require('mnid');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INFURA_ROPSTEN = 'https://ropsten.infura.io';
// Can use http provider from ethjs in the future.


var networks = {
  'mainnet': { id: '0x1',
    registry: '0xab5c8051b9a1df1aab0149f8b0630848b7ecabf6',
    rpcUrl: 'https://mainnet.infura.io' },
  'ropsten': { id: '0x3',
    registry: '0x41566e3a081f5032bdcad470adb797635ddfe1f0',
    rpcUrl: 'https://ropsten.infura.io' },
  'kovan': { id: '0x2a',
    registry: '0x5f8e9351dc2d238fb878b6ae43aa740d62fc9758',
    rpcUrl: 'https://kovan.infura.io' }
  // 'infuranet': {  id: '0x2a'
  //                 registry: '',
  //                 rpcUrl: 'https://infuranet.infura.io' }
};

var DEFAULTNETWORK = 'ropsten';

var configNetwork = function configNetwork() {
  var net = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULTNETWORK;

  if ((typeof net === 'undefined' ? 'undefined' : _typeof(net)) === 'object') {
    ['id', 'registry', 'rpcUrl'].forEach(function (key) {
      if (!net.hasOwnProperty(key)) throw new Error('Malformed network config object, object must have \'' + key + '\' key specified.');
    });
    return net;
  } else if (typeof net === 'string') {
    if (!networks[net]) throw new Error('Network configuration not available for \'' + net + '\'');
    return networks[net];
  }

  throw new Error('Network configuration object or network string required');
};

/**
*  Primary object for frontend interactions with uPort. ConnectCore excludes
*  some functionality found in Connect for a more customizable and lightweight integration.
*  It does not provide any web3 functionality althought you can still use getProvider
*  to get a provider to use with web3 or other libraries. It removes all default
*  QR injection functionality. Your can choose how you want to handle the UX and/or
*  QR generation and use any QR library you choose. For example, if used in a
*  mobile native app QR generation is not even necessary.
*
*/

var ConnectCore = function () {

  /**
   * Instantiates a new uPort connectCore object.
   *
   * @example
   * import { ConnectCore } from 'uport-connect'
   * const uPort = new ConnectCore('Mydapp')
   * @param       {String}            appName                the name of your app
   * @param       {Object}            [opts]                 optional parameters
   * @param       {Object}            opts.credentials       pre-configured Credentials object from http://github.com/uport-project/uport-js object. Configure this if you need to create signed requests
   * @param       {Function}          opts.signer            signing function which will be used to sign JWT's in the credentials object
   * @param       {String}            opts.clientId          uport identifier for your application this will be used in the default credentials object
   * @param       {Object}            [opts.network='kovan'] network config object or string name, ie. { id: '0x1', registry: '0xab5c8051b9a1df1aab0149f8b0630848b7ecabf6', rpcUrl: 'https://mainnet.infura.io' } or 'kovan', 'mainnet', 'ropsten'.
   * @param       {String}            opts.infuraApiKey      Infura API Key (register here http://infura.io/register.html)
   * @param       {Function}          opts.topicFactory      function which generates topics and deals with requests and response
   * @param       {Function}          opts.uriHandler        default function to consume generated URIs for requests, can be used to display QR codes or other custom UX
   * @param       {Function}          opts.mobileUriHandler  default function to consume generated URIs for requests on mobile
   * @param       {Function}          opts.closeUriHandler   default function called after a request receives a response, can be to close QR codes or other custom UX
   * @return      {Connect}                                  self
   */

  function ConnectCore(appName) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ConnectCore);

    this.appName = appName || 'uport-connect-app';
    this.infuraApiKey = opts.infuraApiKey || this.appName.replace(/\W+/g, '-');
    this.provider = opts.provider;
    this.isOnMobile = opts.isMobile === undefined ? isMobile() : opts.isMobile;
    this.topicFactory = opts.topicFactory || (0, _topicFactory2.default)(this.isOnMobile);
    this.uriHandler = opts.uriHandler || defaultUriHandler;
    this.mobileUriHandler = opts.mobileUriHandler;
    this.closeUriHandler = opts.closeUriHandler;
    this.clientId = opts.clientId;
    this.network = configNetwork(opts.network);
    var credentialsNetwork = _defineProperty({}, this.network.id, { registry: this.network.registry, rpcUrl: this.network.rpcUrl });
    this.credentials = opts.credentials || new _uport.Credentials({ address: this.clientId, signer: opts.signer, networks: credentialsNetwork });
    // TODO throw error if this.network not part of network set in Credentials
    this.canSign = !!this.credentials.settings.signer && !!this.credentials.settings.address;
    this.pushToken = null;
  }

  /**
   *  Instantiates and returns a web3 styple provider wrapped with uPort functionality.
   *  For more details see uportSubprovider. uPort overrides eth_coinbase and eth_accounts
   *  to start a get address flow or to return an already received address. It also
   *  overrides eth_sendTransaction to start the send transaction flow to pass the
   *  transaction to the uPort app.
   *
   *  @return          {UportSubprovider}    A web3 style provider wrapped with uPort functionality
   */


  _createClass(ConnectCore, [{
    key: 'getProvider',
    value: function getProvider() {
      return new _uportSubprovider2.default({
        requestAddress: this.requestAddress.bind(this),
        sendTransaction: this.sendTransaction.bind(this),
        provider: this.provider || new _httpprovider2.default(this.network.rpcUrl)
      });
    }

    /**
     *  Creates a request given a request object, will also always return the user's
     *  uPort address. Calls given uriHandler with the uri. Returns a promise to
     *  wait for the response.
     *
     *  @example
     *  const req = {requested: ['name', 'country']}
     *  connect.requestCredentials(req).then(credentials => {
     *      const address = credentials.address
     *      const name = credentials.name
     *      ...
     *  })
     *
     *  @param    {Object}                  [request={}]                    request object
     *  @param    {Function}                [uriHandler=this.uriHandler]    function to consume uri, can be used to display QR codes or other custom UX
     *  @return   {Promise<Object, Error>}                                  a promise which resolves with a response object or rejects with an error.
     */

  }, {
    key: 'requestCredentials',
    value: function requestCredentials() {
      var _this = this;

      var request = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var uriHandler = arguments[1];

      var self = this;
      var receive = this.credentials.receive.bind(this.credentials);
      var topic = this.topicFactory('access_token');
      return new Promise(function (resolve, reject) {
        if (_this.canSign) {
          _this.credentials.createRequest(_extends({}, request, { network_id: _this.network.id, callbackUrl: topic.url })).then(function (requestToken) {
            return resolve('me.uport:me?requestToken=' + encodeURIComponent(requestToken));
          });
        } else {
          if (request.requested && request.requested.length > 0) {
            return reject(new Error('Specific data can not be requested without a signer configured'));
          }
          // TODO remove once enabled in mobile app
          if (request.notifications) {
            return reject(new Error('Notifications rights can not currently be requested without a signer configured'));
          }
          resolve(paramsToUri(_this.addAppParameters({ to: 'me' }, topic.url)));
        }
      }).then(function (uri) {
        return _this.request({ uri: uri, topic: topic, uriHandler: uriHandler });
      }).then(function (jwt) {
        return receive(jwt, topic.url);
      }).then(function (res) {
        if (res && res.pushToken) self.pushToken = res.pushToken;
        return res;
      });
    }

    /**
     *  Creates a request for only the address of the uPort identity. Calls given
     *  uriHandler with the uri. Returns a promise to wait for the response.
     *
     *  @param    {Function}                [uriHandler=this.uriHandler]    function to consume uri, can be used to display QR codes or other custom UX
     *  @return   {Promise<String, Error>}                                  a promise which resolves with an address or rejects with an error.
     */

  }, {
    key: 'requestAddress',
    value: function requestAddress(uriHandler) {
      return this.requestCredentials({}, uriHandler).then(function (profile) {
        return profile.networkAddress || profile.address;
      });
    }

    /**
     *  Consumes a credential object and generates a signed JWT. Creates a request
     *  URI with the JWT. Calls given uriHandler with the URI. Returns a promise to wait
     *  for the response. Throws error if no signer and/or app identifier is set.
     *  Will not always receive a response, response is only a status.
     *
     *  @example
     *  const cred = {
     *    sub: '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347'
     *    claim: {'email': 'hello@uport.me'}
     *    exp: '1300819380'
     *  }
     *  connect.attestCredentials(cred).then(res => {
     *    // response okay, received in uPort app
     *  })
     *
     *  @param    {Object}            credential                      credential object
     *  @param    {String}            credential.sub                  subject of this credential
     *  @param    {Object}            credential.claim                statement(s) which this credential claims, contructed as {key: 'value', ...}
     *  @param    {String}            credential.exp                  expiry time of this credential
     *  @param    {Function}          [uriHandler=this.uriHandler]    function to consume uri, can be used to display QR codes or other custom UX
     *  @return   {Promise<Object, Error>}                            a promise which resolves with a resonse object or rejects with an error.
     */

  }, {
    key: 'attestCredentials',
    value: function attestCredentials(_ref, uriHandler) {
      var sub = _ref.sub,
          claim = _ref.claim,
          exp = _ref.exp;

      var self = this;
      var topic = this.topicFactory('status');
      return this.credentials.attest({ sub: sub, claim: claim, exp: exp }).then(function (jwt) {
        return self.request({ uri: 'me.uport:add?attestations=' + encodeURIComponent(jwt) + '&callback_url=' + encodeURIComponent(topic.url), topic: topic, uriHandler: uriHandler });
      });
    }

    /**
     *  Create a request and returns a promise which resolves the response. This
     *  function is primarly is used by more specified functions in this class, which
     *  allow you to easily create the URIs and messaging server topics you need here.
     *
     *  @param    {Object}     request                                request object
     *  @param    {String}     request.uri                            uPort URI
     *  @param    {String}     request.topic                          messaging server topic object
     *  @param    {String}     [request.uriHandler=this.uriHandler]   function to consume URI, can be used to display QR codes or other custom UX
     *  @return   {Promise<Object, Error>}                            promise which resolves with a response object or rejects with an error.
     */

  }, {
    key: 'request',
    value: function request(_ref2) {
      var _this2 = this;

      var uri = _ref2.uri,
          topic = _ref2.topic,
          uriHandler = _ref2.uriHandler;

      var defaultUriHandler = !uriHandler;

      if (defaultUriHandler) {
        uriHandler = this.uriHandler;
      }

      if (this.pushToken) {
        this.credentials.push(this.pushToken, { url: uri });
        return topic;
      }

      // TODO consider UI for push notifications, maybe a popup explaining, then a loading symbol waiting for a response, a retry and a cancel button. should dev use uriHandler if using push notifications?
      this.isOnMobile && this.mobileUriHandler ? this.mobileUriHandler(uri) : uriHandler(uri, topic.cancel);

      if (defaultUriHandler && !this.isOnMobile && this.closeUriHandler) {
        return new Promise(function (resolve, reject) {
          topic.then(function (res) {
            _this2.closeUriHandler();
            resolve(res);
          }, function (error) {
            _this2.closeUriHandler();
            reject(error);
          });
        });
      } else return topic;
    }

    /**
    *  Builds and returns a contract object which can be used to interact with
    *  a given contract. Similar to web3.eth.contract but with promises. Once specifying .at(address)
    *  you can call the contract functions with this object. It will create a request,
    *  call the uirHandler with the URI, and return a promise which resolves with
    *  a transtaction ID.
    *
    *  @param    {Object}       abi                                   contract ABI
    *  @param    {Function}     [request.uriHandler=this.uriHandler]  function to consume uri, can be used to display QR codes or other custom UX
    *  @return   {Object}                                             contract object
    */

  }, {
    key: 'contract',
    value: function contract(abi) {
      var _this3 = this;

      var txObjectHandler = function txObjectHandler(methodTxObject, uriHandler) {
        return _this3.sendTransaction(methodTxObject, uriHandler);
      };
      return new _uport.ContractFactory(txObjectHandler)(abi);
    }

    /**
     *  Given a transaction object, similarly defined as the web3 transaction object,
     *  it creates a URI which is passes to the uirHandler. It will create request
     *  and returns a promise which resolves with the transaction id.
     *
     *  @example
     *  const txobject = {
     *    to: '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347',
     *    value: '0.1',
     *    function: setStatus(string 'hello', bytes32 '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347'),
     *    appName: 'MyDapp'
     *  }
     *  connect.sendTransaction(txobject).then(txID => {
     *    ...
     *  })
     *
     *  @param    {Object}     txobj                                  transaction object, can also be wrapped using addAppParameters
     *  @param    {Function}   [request.uriHandler=this.uriHandler]   function to consume uri, can be used to display QR codes or other custom UX
     *  @return   {Promise<Object, Error>}                            A promise which resolves with a resonse object or rejects with an error.
     */

  }, {
    key: 'sendTransaction',
    value: function sendTransaction(txobj, uriHandler) {
      var topic = this.topicFactory('tx');
      var uri = paramsToUri(this.addAppParameters(txobj, topic.url));
      return this.request({ uri: uri, topic: topic, uriHandler: uriHandler });
    }

    /**
     *  Adds application specific data to a transaction object. Then uses this data
     *  when requests are created.
     *
     *  @param    {Object}     txobj             transaction object
     *  @param    {String}     callbackUrl       application callback url
     *  @return   {Promise<Object, Error>}       A promise which resolves with a resonse object or rejects with an error.
     */

  }, {
    key: 'addAppParameters',
    value: function addAppParameters(txObject, callbackUrl) {
      var appTxObject = Object.assign({}, txObject);
      if (callbackUrl) {
        appTxObject.callback_url = callbackUrl;
      }
      if (this.appName) {
        appTxObject.label = this.appName;
      }
      if (this.clientId) {
        appTxObject.client_id = this.clientId;
      }
      appTxObject.network_id = this.network.id;
      return appTxObject;
    }
  }]);

  return ConnectCore;
}();

/**
 *  Consumes a params object and creates URI for uPort mobile.
 *
 *  @param    {Object}     params    A object of params known to uPort
 *  @return   {Strings}              A uPort mobile URI
 *  @private
 */


var paramsToUri = function paramsToUri(params) {
  if (!params.to) {
    throw new Error('Contract creation is not supported by uportProvider');
  }
  var networkId = params.network_id || undefined.network.id;
  params.to = (0, _mnid.isMNID)(params.to) || params.to === 'me' ? params.to : (0, _mnid.encode)({ network: networkId, address: params.to });
  var uri = 'me.uport:' + params.to;
  var pairs = [];
  if (params.value) {
    pairs.push(['value', parseInt(params.value, 16)]);
  }
  if (params.function) {
    pairs.push(['function', params.function]);
  } else if (params.data) {
    pairs.push(['bytecode', params.data]);
  }

  var paramsAdd = ['label', 'callback_url', 'client_id'];
  if (params.to === 'me') {
    pairs.push(['network_id', networkId]);
  }

  paramsAdd.map(function (param) {
    if (params[param]) {
      pairs.push([param, params[param]]);
    }
  });
  return uri + '?' + pairs.map(function (kv) {
    return kv[0] + '=' + encodeURIComponent(kv[1]);
  }).join('&');
};

/**
 *  Detects if this library is called on a mobile device or tablet.
 *
 *  @param    {Object}     params    A object of params known to uPort
 *  @return   {Boolean}              Returns true if on mobile or tablet, false otherwise.
 *  @private
 */
function isMobile() {
  if (typeof navigator !== 'undefined') {
    return !!new _mobileDetect2.default(navigator.userAgent).mobile();
  } else return false;
}

/**
 *  ConnectCore has no default URI handler, one must be set
 *
 *  @param    {Object}     uri    A uPort URI
 *  @return   {Error}             Throws Error
 *  @private
 */
function defaultUriHandler(uri) {
  throw new Error('No Url handler set to handle ' + uri);
}

exports.default = ConnectCore;