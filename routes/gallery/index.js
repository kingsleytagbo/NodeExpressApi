const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const configs = require('../../config_functions');
const gallery = require('./gallery_functions');
const formidable = require("formidable");
const LoginFunctions = require('../login/login_functions');

const GalleryFactory = {
    Fields: {
        Name: '', Description: '', Slug: '', Title: '',
        Category: '', Tags: '', ITCC_WebsiteID: -1, ITCC_ImageID: 0,
        CreateDate: new Date(), ModifyDate: new Date(), CreateUserID: -1, ModifyAccountID: -1,
        FileGroup: '', FilePath: '', SourceUrl: '', PublishUrl: '', SourceImageUrl: '',
        UpdateDate: new Date(), UpdateUserID: -1, IsActive: 0,
        CreateAccountID: -1
    }
    , Set: function (value) {
        this.Fields = Object.assign(this.Fields, value);
    }
    , Get: function () {
        return this.Fields;
    }
};


//  http://localhost:3010/api/gallery/FEA91F56-CBE3-4138-8BB6-62F9A5808D57/1
//  http://localhost:3010/api/users/1DC52158-0175-479F-8D7F-D93FC7B1CAA4/page/1
//  https://nodeapi.launchfeatures.com/api/gallery/88B8B45E-2BE7-44CB-BBEA-547BB9A8C7D5/2
// get a paginated list of users
router.get("/:siteid/page/:pagenum/:pagesize", async function (request, response) {
    // Authenticated users only all items
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const pageNum = (request.params.pagenum) ? request.params.pagenum : 1;
    const pageSize = (request.params.pagesize) ? request.params.pagesize : 10; 
    const offset = (pageNum - 1) * pageSize;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser && authUser.RoleNames.length > 0) {
        const result = await gallery.getItems(config, siteid, offset, pageSize);
        return response.status(200).send(result);
    }
    else {
        return response.status(403).send({
            message: 'you do not have permission to access this / POST',
        });
    }

});

// get one gallery
router.get("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser && authUser.RoleNames.length > 0) {
        const result = await gallery.getItem(config, siteid, id);
        return response.send(result);
    }
    else {
        return response.status(403).send({
            message: 'you do not have permission to access this / GALLERY',
        });
    }
});

// create a new gallery along with some basic roles needed to access the system
router.post("/:siteid", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const body = request.body;

    const config = configs.find(siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);
   
    const uploadDir =  path.join(config.fileUploadDirectory, siteid) || path.join(__dirname, "public", "files", siteid);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    if (authUser.RoleNames.indexOf('admin') > -1) {
        const form = new formidable.IncomingForm({
            uploadDir: uploadDir,
            keepExtensions: true,
        });

        form.parse(request, function (err, fields, files) {
            if (err) {
                return response.status(403).send({
                    message: 'you do not have permission to access this / POST',
                });
            }
            else {
                const file = files.file;
                const filepath = file.filepath;
                const newFilename = file.newFilename;
                const originalFilename = file.originalFilename;
                const mimetype = file.mimetype;
                const size = file.size;

                GalleryFactory.Set(fields);
                const dataValues = GalleryFactory.Get();
                dataValues.IsActive = 1;
                dataValues.Slug = newFilename;
                dataValues.FilePath = filepath;
                dataValues.PublishUrl = '/' + newFilename;
                dataValues.Title = originalFilename || newFilename;

                const newTags = (size + ', ' + mimetype);
                dataValues.Tags = dataValues.Tags ? dataValues.Tags += newTags : newTags;

                dataValues.CreateAccountID = authUser.ITCC_UserID;
                dataValues.CreateUserID = authUser.ITCC_UserID;
                dataValues.ModifyAccountID = authUser.ITCC_UserID;
                dataValues.UpdateUserID = authUser.ITCC_UserID;

                const authResult = gallery.createItem(config, siteid, authUser, dataValues);
                authResult.then((result) => {
                    return response.send(result);
                });
            }

        });

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

    const config = configs.find(siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);
    
    const uploadDir =  path.join(config.fileUploadDirectory, siteid) || path.join(__dirname, "public", "files", siteid);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    if (authUser.RoleNames.indexOf('admin') > -1) {
        const form = new formidable.IncomingForm({
            uploadDir: uploadDir,
            keepExtensions: true,
        });

        form.parse(request, function (err, fields, files) {
            if (err) {
                return response.status(403).send({
                    message: 'you do not have permission to access this / POST',
                });
            }
            else {
                const file = files.file;
                const filepath = file.filepath;
                const newFilename = file.newFilename;
                const originalFilename = file.originalFilename;
                const mimetype = file.mimetype;
                const size = file.size;

                console.log({authUser: authUser, fields: fields})

                GalleryFactory.Set(fields);
                const dataValues = GalleryFactory.Get();
                dataValues.IsActive = 1;
                dataValues.Slug = newFilename;
                dataValues.FilePath = filepath;
                dataValues.PublishUrl = '/' + newFilename;
                dataValues.Title = originalFilename || newFilename;

                const newTags = (size + ', ' + mimetype);
                dataValues.Tags = dataValues.Tags ? dataValues.Tags += newTags : newTags;

                dataValues.CreateAccountID = authUser.ITCC_UserID;
                dataValues.CreateUserID = authUser.ITCC_UserID;
                dataValues.ModifyAccountID = authUser.ITCC_UserID;
                dataValues.UpdateUserID = authUser.ITCC_UserID;

                const authResult = gallery.updateItem(config, siteid, authUser, dataValues);
                authResult.then((result) => {
                    return response.send(result);
                });
            }

        });

    }
    else {
        return response.status(403).send({
            message: 'you do not have permission to access this / POST',
        });
    }
});

// delete a gallery
router.delete("/:siteid/:id", async function (request, response) {
    // admin can delete any gallery
    // Authenticated users can only delete their own galelry
    // Unauthenticated users cannot delete any thing
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);
    const galleryItem = await gallery.getItem(config, siteid, id);

    if ( (authUser.RoleNames.indexOf('admin') > -1) || (authUser.ITCC_UserID === galleryItem.CreateAccountID) ) {
        await gallery.deleteItem(config, siteid, id);
        return response.send(id);
    }
    else {
        return response.status(403).send({
            message: 'you do not have permission to access this / POST',
        });
    }
});

module.exports = router;