const router = require('express').Router();
const configs = require('../../config_functions'); //require('../../config');
const gallery = require('./gallery_functions');
const login = require('../login/login_functions');
const LoginFunctions = require('../login/login_functions');


//  http://localhost:3010/api/gallery/FEA91F56-CBE3-4138-8BB6-62F9A5808D57/1
//  http://localhost:3010/api/users/1DC52158-0175-479F-8D7F-D93FC7B1CAA4/page/1
//  https://nodeapi.launchfeatures.com/api/gallery/88B8B45E-2BE7-44CB-BBEA-547BB9A8C7D5/2
// get a paginated list of users
router.get("/:siteid/page/:pagenum?", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const pageNum = (request.params.pagenum) ? request.params.pagenum : 1;
    const pageSize = 20; 
    const offset = (pageNum - 1) * pageSize;

    console.log({
        'list gallerys': {
            params: request.params, authID: authID,  authToken:  authToken
        }
    })

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await login.getUserRolesByAuthToken(config, siteid, authID);
    const itemsResult = await gallery.getItems(config, siteid, offset, pageSize);
    const result = itemsResult.recordset;

    if (roleNames && roleNames.indexOf('admin') > -1) {
        return response.status(200).send(result);
    }
    else {
        // return a trimmed down result
        return response.status(200).send(result);
    }

});

// get one gallery
router.get("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    console.log({
        'one gallery': {
            params: request.params, authid: authID, id: id
        }
    })

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await login.getUserRolesByAuthToken(config, siteid, authID);

    if (roleNames && roleNames.indexOf('admin') > -1) {
        const authResult = await gallery.getItem(config, siteid, id);
        const result =  (authResult.recordset && (authResult.recordset.length > 0))
        ? authResult.recordset[0] : null;
        return response.send(result);
    }
    else {
        return response.status(403).send({
            message: 'you do not have permission to access this / POST',
          });
    }
});

// create a new gallery along with some basic roles needed to access the system
router.post("/:siteid", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;
    const firstname = request.body.firstname;
    const lastname = request.body.lastname;
    const username = request.body.username;
    const emailaddress = request.body.emailaddress;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await login.getUserRolesByAuthToken(config, siteid, authID);

    if (roleNames.indexOf('admin') > -1) {
        const authResult = await gallery.createItem(config, siteid, 
            username, username, username, emailaddress, 1, 1, 0,
            emailaddress, 1, 1, 1);
        const result =  authResult.recordset;
        return response.send(result);
    }
    else {
        return response.status(403).send({
            message: 'you do not have permission to access this / POST',
          });
    }
});

// delete a gallery
router.delete("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await login.getUserRolesByAuthToken(config, siteid, authID);

    if (roleNames.indexOf('admin') > -1) {
        const authResult = await gallery.deleteItem(config, siteid, id);
        const result =  authResult.recordset;
        return response.send(result);
    }
    else {
        return response.status(403).send({
            message: 'you do not have permission to access this / POST',
          });
    }
});

// update a gallery
router.put("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.body.id;
    const username = request.body.username;
    const emailaddress = request.body.emailaddress;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await login.getUserRolesByAuthToken(config, siteid, authID);

    if (roleNames.indexOf('admin') > -1) {
        const authResult = await gallery.updateItem(config, siteid, id, username, emailaddress);
        const result =  authResult.recordset;
        return response.send(result);
    }
    else {
        return response.status(403).send({
            message: 'you do not have permission to access this / POST',
          });
    }
});

module.exports = router;