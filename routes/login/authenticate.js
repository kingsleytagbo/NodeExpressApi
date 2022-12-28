const router = require('express').Router();
const configs = require('../../config_functions'); //require('../../config');
const login = require('./login_functions');

// Validates a user's login information based on the username and password
// Returns the login user's authentication information including a Login Token
router.post("/:siteid", async (request, response) => {
    try {
        const siteid = request.params.siteid;
        const headers = request.headers;
        // parse login and password from headers
        const base64AuthenticationHeader = (headers.authorization || '').split(' ')[1] || '';
        const [username, password] = Buffer.from(base64AuthenticationHeader, 'base64').toString().split(':');

        const config = configs.find(siteid); //(c => c.privateKeyID === siteid);

         const authResult = await login.updateUserLoginInfo(config, username, password, siteid);
         const loginResult = await login.getUserByLogin(config, username, password, siteid);
        const loginUser =  (loginResult.recordset && loginResult.recordset.length === 1)? loginResult.recordset[0] : null;
        loginUser.RoleNames = (loginUser.RoleNames.length > 0) ? loginUser.RoleNames.split(',') : [];
        //console.log({authResult: authResult, loginUser: loginUser ,AuthID: loginUser.AuthID})

        if( 
            (loginUser && loginUser.AuthID) && 
            (authResult && authResult.AuthID) && 
            (loginUser.AuthID === authResult.AuthID) ){
            //await login.updateUserLoginInfo(config, username, password, siteid, loginUser.AuthID);
            return response.send(loginUser);
        }else{
            response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return response.sendStatus(401);
        }

    }
    catch (err) {
        return response.status(500).send({error: 'an error has occured'});
    }
});


module.exports = router;