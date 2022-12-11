const config = [
    {
        configPath: 'A:/Projects/Coding/CMS/node-configs/connect-stlouis.config',
        user: 'your sql server user id',
        password: 'your sql server password',
        server: 'your sql server server name',
        database: 'your sql server database name',
        privateKeyID: 'your multi-tenant unique identifier',
        options: {
            enableArithAbort: true
        },
        fileUploadDirectory: ''
    }
    
];

module.exports = config;