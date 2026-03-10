const PROXY_CONFIG = {
  context: [
    "/healthconnect",
    "/oauth2",
    "/login/oauth2",
    "/exploitation"
  ],
  "target": "https://192.168.1.20/",
  "secure": false,
  "bypass": function (req, res, proxyOptions) {
    req.headers["webpass-remote-user"] = "TOTO_USER";
  }
}

module.exports = PROXY_CONFIG;