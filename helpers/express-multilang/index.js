const path = require('path');

class Lang {
    constructor(def = 'en', messages = {}){
        this.config = {};
        this.config.def = def;
        this.config.messages = messages;
    }

    translate(key){
        const { def, messages } = this.config;
        return messages[def][key] || key;
    }
}

module.exports = Lang;