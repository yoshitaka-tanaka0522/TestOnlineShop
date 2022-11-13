// Module installation
const crypto = require('crypto');
// The key for encryption, originally written in the env file for security reasons
const key = 'Ag3478eb15fh45019a5f9696c912cT62';

const algorithm = 'aes-256-cbc';
const delimiter = '$';

const encode = (originalText) => {
  const cipher = crypto.createCipher('aes-256-cbc', "pass")
  const crypted = cipher.update(originalText, 'utf-8', 'hex')
  const text = crypted + cipher.final('hex')
  return text;
};

console.log(encode('grader'))