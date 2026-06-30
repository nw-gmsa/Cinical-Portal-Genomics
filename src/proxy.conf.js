const PROXY_CONFIG = {
  "/healthconnect/**" : {
    "target": "https://192.168.1.20/",
    "secure": false,
    "bypass": function (req, res, proxyOptions) {
      req.headers["webpass-remote-user"] = "TOTO_USER";
    }
  },
  "/dataplatform/**" : {
    "target": "https://gen-tie-test.nwgenomics.nhs.uk",
    "secure": false,
    "bypass": function (req, res, proxyOptions) {
      req.headers["webpass-remote-user"] = "TOTO_USER";
    }
  }
}

module.exports = PROXY_CONFIG;
