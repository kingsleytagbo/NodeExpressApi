const SharedFunctions = {

    slugify: (text) => {
        let str = text ? text.trim() : '';

        try {

            str = str.replace(/^\s+|\s+$/g, ''); // trim
            str = str.toLowerCase();
            str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-') // collapse whitespace and replace by -
                .replace(/-+/g, '-'); // collapse dashes

        if(str.length > 256){
            str = String(str).substring(0, 255).trim();
        }

        } catch { }

        return str;
    }

};

module.exports = SharedFunctions;