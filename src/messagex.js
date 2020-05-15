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
        body: { type: 'string' },
    },
    required: ['type', 'body'],
}

const attachmentSchema = {
    id: '/attachment',
    type: 'object',
    properties: {
        contentEncoded: { type: 'string' },
        mimeType: { type: 'string' },
        filename: { type: 'string' },
    },
    required: ['contentEncoded', 'mimeType', 'filename'],
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
v.addSchema(headerSchema, '/header');
v.addSchema(contactSchema, '/contact');
v.addSchema(contentSchema, '/content');
v.addSchema(attachmentSchema, '/attachment');
v.addSchema(mailSchema, '/attachment');
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
        callback('', { statusCode: response.status, status: response.status + ' ' + response.statusText, bearerToken: response.data.data.bearerToken, expires: response.data.data.expiresAt });
    })
    .catch(function (error) {
        callback(error);
    });
    
    // return the promise if no callback specified
    return promise;
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
        id: '/contactarray',
        type: 'array',
        items: { '$ref': '/contact' }
    };
    v.addSchema(contactArraySchema, '/contactarray');
    if (!mailOptions.to || !v.validate(mailOptions.to, contactArraySchema).valid) {
        callback(Error('One or more to addresses are invalid'))
    }
    // Check if cc and bcc are specified. If specified, validate their schemas
    if (mailOptions.cc && !v.validate(mailOptions.cc, contactArraySchema).valid) {
        callback(Error('One or more cc addresses are invalid'))
    }
    if (mailOptions.bcc && !v.validate(mailOptions.bcc, contactArraySchema).valid) {
        callback(Error('One or more bcc addresses are invalid'))
    }
    // check if subject is specified
    if (!mailOptions.subject || !v.validate(mailOptions.subject, { type: 'string' }).valid) {
        callback(Error('Subject is either undefined or invalid'))
    }
    // check if message has content
    if (!mailOptions.content) {
        callback(Error('Emails must have a body'));
    } else {
        mailOptions.content.forEach(function(content, index) {
            if (!v.validate(content, contentSchema).valid){
                callback(Error('Email Body is invalid'));
            }
        });
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
    return promise;
}

module.exports = {
    authenticate,
    sendMail
}