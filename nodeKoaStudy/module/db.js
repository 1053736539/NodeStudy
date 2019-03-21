// DB库
var MongoClint = require("mongodb").MongoClient;
var Config = require('./config.js');


class MongoDb {
    static getInstance() {
        if (!MongoDb.instance) {
            MongoDb.instance = new MongoDb();
        }
        return MongoDb.instance;
    }


    constructor() {
        this.dbClient = '';/* 存放DB对象*/
        this.connect();
    }

    connect() {/*连接数据库*/
        let _this = this;
        return new Promise((resolve, reject) => {
            if (!_this.dbClient) {
                MongoClint.connect(Config.dbUrl, (err, client) => {
                    if (err) {
                        reject(err);
                    } else {
                        var db = client.db(Config.dbName);
                        _this.dbClient = db;
                        resolve(_this.dbClient)
                    }
                })
            }

        })
    }

    find(collectionName, json) {
        // 查询数据
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                var result = db.collection(collectionName).find(json);
                result.toArray(function (err, docs) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(docs);
                })
            })
        })
    }

    updata(collectionName, json) {
        // 更新数据
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.updateOne(collectionName, json1, {
                    $set: json2
                }, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        })
    }

    insert(collectionName, json) {
        /***增加数据**/
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName.insertOne(json, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    return result;
                }))
            })
        })
    }


}


module.exports = (MongoDb.getInstance());
