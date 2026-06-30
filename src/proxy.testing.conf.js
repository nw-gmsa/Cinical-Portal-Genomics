

const PROXY_CONFIG = {
  "/dataplatform/**" : {
    "target": "https://gen-tie-test.nwgenomics.nhs.uk",
    "secure": false,
    "bypass": function (req, res, proxyOptions) {
      req.headers["webpass-remote-user"] = "TOTO_USER";
    }
  }
}

module.exports = PROXY_CONFIG;
