const fs = require('fs');
if (process.env.CA_CERT) {
  fs.writeFileSync('ca.pem', process.env.CA_CERT);
  console.log('ca.pem written');
}