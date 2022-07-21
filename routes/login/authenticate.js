const router = require('express').Router();
const configs = require('../../config');
const login = require('./login_functions');

// Validates a user's login information based on the username and password
// Returns the login user's authentication information including a Login Token
router.post("/:siteid", async (request, response) => {
    try {
        const siteid = request.params.siteid;
        const headers = request.headers;
        // parse login and password from headers
        const base64AuthenticationHeader = (headers.authorization || '').split(' ')[1] || '';
        const [username, password] = Buffer.from(base64AuthenticationHeader, 'base64').toString().split(':')

        const config = configs.find(c => c.privateKeyID === siteid);

        const loginResult = await login.getUserByLogin(config, username, password, siteid);
        const loginUser =  (loginResult.recordset && loginResult.recordset.length === 1)? loginResult.recordset[0] : null;
        
        if(loginUser && loginUser.AuthID){
            await login.updateUserLoginInfo(config, username, password, siteid, loginUser.AuthID);
            return response.send(loginUser);
        }else{
            response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return response.sendStatus(401);
        }

    }
    catch (err) {
        return response.send({error: 'an error has occured', err: err});
    }
});


module.exports = router;