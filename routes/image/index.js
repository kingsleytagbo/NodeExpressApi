const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const configs = require('../../config_functions');

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

// get one image
// http://localhost:3011/api/image/1DC52158-0175-479F-8D7F-D93FC7B1CAA4/a96b842cb21d1aa627aa93c00.png
router.get("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const id = request.params.id;
    const config = configs.find(siteid);
    const uploadDir =  path.join(config.fileUploadDirectory, siteid) || path.join(__dirname, "public", "files", siteid);

    const filePath = uploadDir + '\\' + id;
    const blankImagePath = path.join(__dirname, "public", "files", "blank_image.png");

    fs.exists(filePath, function (exists) {
        console.log(
            {
                filePath: filePath, blankImagePath: blankImagePath, id: id,
                uploadDir: uploadDir, exists: exists
            }
        )
      if (!exists) {
        response.writeHead(200, {
          'Content-Type': 'image/jpg',
        });

        fs.readFile(blankImagePath, function (err, content) {
          response.end(content);
        });
      } else {
        const fileExtension = path.extname(filePath);
        let contentType = 'image/png';
        if (fileExtension === '.png') {
          contentType = 'image/png';
        } else if (fileExtension === '.jpg') {
          contentType = 'image/jpeg';
        } else if (fileExtension === '.jpeg') {
          contentType = 'image/jpeg';
        }

        // Setting the headers
        response.writeHead(200, {
          'Content-Type': contentType,
        });
        // Reading the file
        fs.readFile(filePath, function (err, content) {
          // Serving the image
          response.end(content);
        });
      }
    });

   // response.status(200);

});

module.exports = router;