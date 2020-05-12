const axios = require('axios');
const Validator = require('jsonschema').Validator;
const v = new Validator();

const baseUrl = 'http://api.messagex.test:8080/api/';


const headerSchema = {
    id: '/header',
    type: 'object',
    properties: {
        name: { type: 'string'},
        vallue: { type: 'string' },
    }
};

const contactSchema = {
    id: '/contact',
    type: 'object',
    properties: {
        name: {
            type: 'string',
        },
        address: {
            type: 'string',
        },
    },
    required: ['address'],
};

const contentSchema = {
    id: '/content',
    type: 'object',
    properties: {
        type: { type: 'string' },
        content: { type: 'string' },
    },
    required: ['type', 'content'],
}

const attachmentSchema = {
    id: '/attachment',
    type: 'object',
    properties: {
        contentEncoded: { type: 'string' },
        mimeType: { type: 'string' },
        filename: { type: 'string' },
        attachmentType: { type: 'string' },
    },
    required: ['contentEncoded', 'mimeType', 'filename', 'attachmentType'],
}

const mailSchema = {
    id: '/Mail',
    type: 'object',
    properties: {
        contactGroupId: { type: 'string' },
        unsubscribeGroupId: { type: 'string' },
        from: { '$ref': '/contact' },
        to: {
            type: 'array',
            items: { '$ref': '/contact' },
        },
        cc: {
            type: 'array',
            items: { '$ref': '/contact' },
        },
        bcc: {
            type: 'array',
            items: { '$ref': '/contact' },
        },
        subject: { type: 'string' },
        content: {
            type: 'array',
            items: { '$ref': '/content' },
        },
        replyTo: { '$ref': '/contact' },
        headers: {
            type: 'array',
            items: { '$ref': '/header' },
        },
        attachments: {
            type: 'array',
            items: { '$ref': '/attachment' },
        },
        analytics: {
            type: 'object',
            properties: {
                utm_source: { type: 'string' },
                utm_medium: { type: 'string' },
                utm_term: { type: 'string' },
                utm_content: { type: 'string' },
                utm_campaign: { type: 'string' },
            }
        }
    }
}

function authenticate(apiKey, apiSecret, callback) {
    // Setup Promise if no callback specified.
    var promise;
    if (!callback) {
        promise = new Promise(function(res, rej) {
            callback = function(err, result) {
                err ? rej(err) : res(result)
            }
        })
    }
    // Check if all required params are specified.
    if (!apiKey || !apiSecret) {
        callback(Error('apiKey and apiSecret are both required parameters.'));
    }
    
    // Authenticate user.
    axios.post(baseUrl + 'authorise', {
        apiKey: apiKey,
        apiSecret: apiSecret
    })
    .then(function (response) {
        callback('', { statusCode: response.status, status: response.status + ' ' + response.statusText, bearerToken: response.data.bearerToken, expires: response.data.expiresAt });
    })
    .catch(function (error) {
        callback(error);
    });
    
    // return the promise if no callback specified
    return prommise;
}

function sendMail(bearerToken, mailOptions, callback) {
    // Setup Promise if no callback specified.
    var promise;
    if (!callback) {
        promise = new Promise(function(res, rej) {
            callback = function(err, result) {
                err ? rej(err) : res(result)
            }
        })
    }
    // Validate if token specified

    // Validate the incoming mailOptions
    if (!mailOptions) {
        callback(Error('No mail options specified'));
    }
    // check if from address is specified
    if (!mailOptions.from || !v.validate(mailOptions.from, contactSchema).valid) {
        callback(Error('From address is compulsory'))
    }
    // check if atleast one to address is specified
    var contactArraySchema = {
        type: 'array',
        items: { '$ref': '/contact' }
    }
    if (!mailOptions.to || !v.validate(mailOptions.to, contactArraySchema).valid) {
        callback(Error('One or more to addresses are invalid'))
    }
    // check if subject is specified
    if (!mailOptions.subject || !v.validate(mailOptions.subject, { type: 'string' }).valid) {
        callback(Error('Subject is either undefined or invalid'))
    }
    // check if message has content
    var contentArraySchema = {
        type: 'array',
        items: { '$ref': '/content' }
    }
    if (!mailOptions.contentArraySchema || !v.validate(mailOptions.content, contentArraySchema).valid) {
        callback(Error('One or more to addresses are invalid'))
    }
    // Compulsory fields have been validated
    // Send email
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + bearerToken
    };
    axios.post(baseUrl + 'mail/send', mailOptions, {
        headers: headers
    })
    .then(function(response){
        callback('', { statusCode: response.status, status: response.statusText, message: response.data });
    })
    .catch(function(error) {
        callback(error);
    });
    // return the promise if no callback specified
    return prommise;
}

module.exports = {
    authenticate,
    sendMail
}