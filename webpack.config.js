module.exports = {
  resolve: {
    fallback: { 
        "url": require.resolve("url/"),
        "http": require.resolve("stream-http"),
        "https": false,
        "stream": false,
        "assert": require.resolve("assert/"),
        "zlib": false,
     }
  }
};