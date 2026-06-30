const PROXY_CONFIG = {
  "/healthconnect/**" : {
    "target": "https://gen-tie-dev.nwgenomics.nhs.uk",
    "secure": false,
    "bypass": function (req, res, proxyOptions) {
      req.headers["webpass-remote-user"] = "TOTO_USER";
    }
  },
  "/dataplatform/**" : {
    "target": "https://gen-tie-dev.nwgenomics.nhs.uk",
    "secure": false,
    "bypass": function (req, res, proxyOptions) {
      req.headers["webpass-remote-user"] = "TOTO_USER";
    }
  }
}

module.exports = PROXY_CONFIG;
