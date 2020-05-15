const assert = require('assert');
const nock = require('nock');
const messagex = require('../src/messagex');

const apiBaseUrl = 'http://api.messagex.test:8080'

const apiAuthSuccessRequest = {
	apiKey: 'V8yjr16wySux4143ipmfbo4saEK5Qw5odX1TMOoSG6SVWge8Zg10OIkUAWJQJlew',
	apiSecret: 'vmENsH10SO5QXHDBwoweGw2tczPOn87vir2rbZDskfSyy1yyvcqY33T6PWAZqvVY'
};

const apiAuthFailureRequest = {
	apiKey: 'V8yjr16wySux4143ipmfbo4saEK5Qw5odX1TMOoSG6SVWge8Zg10OIkUAWJQJlew',
	apiSecret: 'vmENsH10SO5QXHDBwoweGw2tczPOn87vir2rbZDskfSyy1yyvcqY33T6PWAZqqVY'
};

const apiAuthenticateSuccessResponse = {
    data: {
        id: 69,
        bearerToken: '18wlqE50EyyKCYWs8wpS3CtVMvmYmYdCQiyWAGvHJua7a6KwmjltVoD3HEPENJkdyXatdPzI1hanPyQ5PQnqdsajtBzmghSoJOICr3oSezMApQs1lNm2VFhBVaOy8fuQ',
        refreshToken: 'ySdnZTx3A6AP317OON4NQ8xlMOjn8THdoJNpXV6MRXEwLxamSRQNPZUZQR2sUyTb66azwUG0qf2gplniQCHLl7O9A5UE7a5blFsqVE4heOavy6H2xOM4eFzHowQM8rYn',
        expiresAt: '2020-05-21 02:06:37',
        apiKeyId: 1,
        updatedAt: '2020-05-14 02:06:37',
        createdAt: '2020-05-14 02:06:37',
        createdAtEpoc: 1589421997,
        updatedAtEpoch: 1589421997
    }
};

const apiAuthenticateFailureResponse = {
    message: 'The given data was invalid',
    errors: {
        'apiKey/apiSecret': [
            'API key and/or secret are incorrect.'
        ]
    }
};

const apiMailSendEmptyRequestBodyResponse = {
    error: 'Mandatory fields missing',
};

const apiMailSendSuccessRequest = {
    from: {
        address: 'sender@messagex.com',
        name: 'Sender',
    },
    to: [
        {
            address: 'recipeint1@messagex.com',
            name: 'Recipient 1',
        },
        {
            address: 'recipeint2@messagex.com',
            name: 'Recipient 2',
        },
    ],
    cc: [
        {
            address: 'cc1@messagex.com',
            name: 'CC 1',
        },
        {
            address: 'cc2@messagex.com',
            name: 'CC 2',
        },
    ],
    subject: 'Test Email Subject',
    content: [
        {
            type: 'text/plain',
            body: 'Test email body',
        },
        {
            type: 'text/html',
            body: '<html><head><title>Test HTML email body</title></head><body><p>Test HTML Email body</p></body></html>',
        },
    ],
    replyTo: {
        address: 'replyto@messagex.com'
    },
};

const apiMailSendFailContactValidationRequest = {
    from: {
        address: 'sender@messagex.com',
        name: 'Sender',
    },
    to: [
        {
            name: 'Recipient 1',
        },
        {
            address: 'recipeint2@messagex.com',
            name: 'Recipient 2',
        },
    ],
    cc: [
        {
            address: 'cc1@messagex.com',
            name: 'CC 1',
        },
        {
            address: 'cc2@messagex.com',
            name: 'CC 2',
        },
    ],
    subject: 'Test Email Subject',
    content: [
        {
            type: 'text/plain',
            body: 'Test email body',
        },
        {
            type: 'text/html',
            body: '<html><head><title>Test HTML email body</title></head><body><p>Test HTML Email body</p></body></html>',
        },
    ],
    replyTo: {
        address: 'replyto@messagex.com'
    },
};

const apiMailSendFailCCContactValidationRequest = {
    from: {
        address: 'sender@messagex.com',
        name: 'Sender',
    },
    to: [
        {
            address: 'recipeint1@messagex.com',
            name: 'Recipient 1',
        },
        {
            address: 'recipeint2@messagex.com',
            name: 'Recipient 2',
        },
    ],
    cc: [
        {
            name: 'CC 1',
        },
        {
            address: 'cc2@messagex.com',
            name: 'CC 2',
        },
    ],
    subject: 'Test Email Subject',
    content: [
        {
            type: 'text/plain',
            body: 'Test email body',
        },
        {
            type: 'text/html',
            body: '<html><head><title>Test HTML email body</title></head><body><p>Test HTML Email body</p></body></html>',
        },
    ],
    replyTo: {
        address: 'replyto@messagex.com'
    },
};

const apiMailSendFailBCCContactValidationRequest = {
    from: {
        address: 'sender@messagex.com',
        name: 'Sender',
    },
    to: [
        {
            address: 'recipeint1@messagex.com',
            name: 'Recipient 1',
        },
        {
            address: 'recipeint2@messagex.com',
            name: 'Recipient 2',
        },
    ],
    cc: [
        {
            address: 'cc1@messagex.com',
            name: 'CC 1',
        },
        {
            address: 'cc2@messagex.com',
            name: 'CC 2',
        },
    ],
    bcc: [
        {
            name: 'BCC 1',
        },
        {
            address: 'bcc2@messagex.com',
            name: 'BCC 2',
        },
    ],
    subject: 'Test Email Subject',
    content: [
        {
            type: 'text/plain',
            body: 'Test email body',
        },
        {
            type: 'text/html',
            body: '<html><head><title>Test HTML email body</title></head><body><p>Test HTML Email body</p></body></html>',
        },
    ],
    replyTo: {
        address: 'replyto@messagex.com'
    },
};

const apiMailSendFailContentValidationRequest = {
    from: {
        address: 'sender@messagex.com',
        name: 'Sender',
    },
    to: [
        {
            address: 'recipeint1@messagex.com',
            name: 'Recipient 1',
        },
        {
            address: 'recipeint2@messagex.com',
            name: 'Recipient 2',
        },
    ],
    cc: [
        {
            address: 'cc1@messagex.com',
            name: 'CC 1',
        },
        {
            address: 'cc2@messagex.com',
            name: 'CC 2',
        },
    ],
    subject: 'Test Email Subject',
    content: [],
    replyTo: {
        address: 'replyto@messagex.com'
    },
};

describe('MessageX Send Mail', function() {
    nock(apiBaseUrl)
        .post('/api/authorise', apiAuthSuccessRequest)
        .reply(200, apiAuthenticateSuccessResponse);

    nock(apiBaseUrl)
        .post('/api/authorise', apiAuthFailureRequest)
        .reply(401, apiAuthenticateFailureResponse);

    describe('Authenticate', function() {
        it('should authenticate successfully with the correct auth credentials', function(){
            const apiKey = 'V8yjr16wySux4143ipmfbo4saEK5Qw5odX1TMOoSG6SVWge8Zg10OIkUAWJQJlew';
            const apiSecret = 'vmENsH10SO5QXHDBwoweGw2tczPOn87vir2rbZDskfSyy1yyvcqY33T6PWAZqvVY'
            messagex.authenticate(apiKey, apiSecret, function (err, response) {
                assert.equal(err, '');
                assert.equal(response.statusCode, 200);
                assert.equal(response.bearerToken, apiAuthenticateSuccessResponse.data.bearerToken);
            });
        });

        it('should not authenticate successfully with the incorrect auth credentials', function(){
            const apiKey = 'V8yjr16wySux4143ipmfbo4saEK5Qw5odX1TMOoSG6SVWge8Zg10OIkUAWJQJlew';
            const apiSecret = 'vmENsH10SO5QXHDBwoweGw2tczPOn87vir2rbZDskfSyy1yyvcqY33T6PWAZqqVY'
            messagex.authenticate(apiKey, apiSecret, function (err, response) {
                assert.notEqual(err, '');
            });
        });

        it ('should fail if no apiKey or apiSecret are specified', function() {
            messagex.authenticate('', '', function(err, response) {
                assert.notEqual(err, '');
            })
        });
    });

    describe('Send Mail', function() {
        
        it('should fail if the request body is empty', function() {
            nock(apiBaseUrl, {
                reqheaders: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + apiAuthenticateSuccessResponse.data.bearerToken,
                },
            })
                .post('/api/mail/send')
                .reply(500, apiMailSendEmptyRequestBodyResponse);
            
            messagex.sendMail(apiAuthenticateSuccessResponse.data.bearerToken, {}, function(err, response) {
                assert.notEqual(err, '');
            });
        });

        it('should successfully send an email', function() {
            nock(apiBaseUrl, {
                reqHeaders: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + apiAuthenticateSuccessResponse.data.bearerToken,
                },
            })
            .post('/api/mail/send', apiMailSendSuccessRequest)
            .reply(200, {
                success: true,
            });
            messagex.sendMail(apiAuthenticateSuccessResponse.data.bearerToken, apiMailSendSuccessRequest, function(err, response){
                assert.equal(err, '');
            })
        });

        it('should fail contact validation', function() {
            nock(apiBaseUrl, {
                reqHeaders: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + apiAuthenticateSuccessResponse.data.bearerToken,
                },
            })
            .post('/api/mail/send', apiMailSendFailContactValidationRequest)
            .reply(200, {
                success: true,
            });
            messagex.sendMail(apiAuthenticateSuccessResponse.data.bearerToken, apiMailSendFailContactValidationRequest, function(err, response) {
                assert.notEqual(err, '');
            });
        });

        it('should fail cc contact validation', function() {
            nock(apiBaseUrl, {
                reqHeaders: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + apiAuthenticateSuccessResponse.data.bearerToken,
                },
            })
            .post('/api/mail/send', apiMailSendFailCCContactValidationRequest)
            .reply(200, {
                success: true,
            });
            messagex.sendMail(apiAuthenticateSuccessResponse.data.bearerToken, apiMailSendFailCCContactValidationRequest, function(err, response) {
                assert.notEqual(err, '');
            });
        });

        it('should fail bcc contact validation', function() {
            nock(apiBaseUrl, {
                reqHeaders: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + apiAuthenticateSuccessResponse.data.bearerToken,
                },
            })
            .post('/api/mail/send', apiMailSendFailBCCContactValidationRequest)
            .reply(200, {
                success: true,
            });
            messagex.sendMail(apiAuthenticateSuccessResponse.data.bearerToken, apiMailSendFailBCCContactValidationRequest, function(err, response) {
                assert.notEqual(err, '');
            });
        });

        it('should fail content validation', function() {
            nock(apiBaseUrl, {
                reqHeaders: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + apiAuthenticateSuccessResponse.data.bearerToken,
                },
            })
            .post('/api/mail/send', apiMailSendFailContentValidationRequest)
            .reply(200, {
                success: true,
            });
            messagex.sendMail(apiAuthenticateSuccessResponse.data.bearerToken, apiMailSendFailContentValidationRequest, function(err, response) {
                assert.notEqual(err, '');
            });
        });
    });
});