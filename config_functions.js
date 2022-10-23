
const appDefaultLocalHostConfig = 'A:/Projects/Coding/CMS/node-configs/node-configs.config';
const configs = require('./config');

const ConfigFunctions = {
    /*
       Get the App Configutaion based on the Private Key
    */
    find: (privateKeyID) => {
        try {
            const siteid = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;
            let config = configs.find(c => c.privateKeyID === siteid);
            //console.log({ config1: config, siteid: siteid });

            if (!config) {
                const localHostConfig = require(appDefaultLocalHostConfig);
                config = localHostConfig.find(c => String(c.privateKeyID).trim().toLocaleLowerCase() === siteid);
                // console.log({ config2: config, localHostConfig: localHostConfig, siteid: siteid });
            }

            return config;
        } catch (err) {
            //console.log({ find: err, configs: configs, local: appDefaultLocalHostConfig });
            throw err;
        }
    }
};

module.exports = ConfigFunctions;

