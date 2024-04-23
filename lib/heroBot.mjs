/**
 * HeroUnion Bot SDK
 */

import test from 'node:test';
import assert from 'node:assert';
import axios from 'axios';
import md5 from 'md5';


class HeroBot {
    constructor(
        server_url,
        bot_name,
        bot_description,
        support_platforms,
        support_contracts,
        bot_country,
        bot_lang,
        bot_contact,
        data_mode
    ) {
        //必填参数
        this.union_server = server_url;
        this.name = bot_name;
        this.description = bot_description;
        this.platforms = support_platforms;
        this.contracts = support_contracts;

        //可选参数
        this.country = typeof(bot_country) != 'undefined' ? bot_country : 'cn';
        this.lang = typeof(bot_lang) != 'undefined' ? bot_lang : 'zh';
        this.contact = typeof(bot_contact) != 'undefined' ? bot_contact : '';
        this.data_mode = typeof(data_mode) != 'undefined' ? data_mode : 'json';

        //联盟API地址
        this.apis = {
            "heartBeat": `${server_url}/api/onboard/`,
            "getNewTask": `${server_url}/api/gettask/`,
            "saveTaskData": `${server_url}/api/savetask/`,
        };

        //axios请求配置
        this.axiosConfig = {
            timeout: 8000,          //请求超时
            proxy: false            //是否走代理
        };
    }

    getTimestampInSeconds() {
        return Math.floor(Date.now() / 1000);
    }

    sortDict(obj) {                         //dict按key排序
        return Object.keys(obj).sort().reduce(function(result, key) {
            result[key] = obj[key];
            return result;
        }, {});
    }

    sign(params, token) {                    //对参数做MD5签名
        return md5( JSON.stringify(this.sortDict(params)) + token );
    }

    //向联盟发送心跳数据
    async heartBeat(status) {
        let params = {
            name: this.name,
            description: this.description,
            status: status,
            timestamp: this.getTimestampInSeconds(),
            platforms: this.platforms,
            contracts: this.contracts,
            country: this.country,
            lang: this.lang,
            contact: this.contact
        };

        let response = null;
        
        try {
            response = await axios.post(this.apis.heartBeat, params, this.axiosConfig);
        }catch(err) {
            console.error('[ERROR] HeroBot heart beat failed: %s, api: %s, params: %s',
                err,
                this.apis.heartBeat,
                JSON.stringify(params)
            );
        }

        return response ? response.data : false;
    }

    //从联盟领取任务
    async getNewTask() {
        let params = {
            platforms: this.platforms,
            contracts: this.contracts,
            data_mode: this.data_mode,
            country: this.country,
            lang: this.lang
        };

        let queryOption = this.axiosConfig;
        queryOption.method = 'get';
        queryOption.url = this.apis.getNewTask;
        queryOption.params = params;

        let response = null;

        try {
            response = await await axios(queryOption);
        }catch(err) {
            console.error('[ERROR] HeroBot get new task failed: %s, api: %s, params: %s',
                err,
                this.apis.getNewTask,
                JSON.stringify(params)
            );
        }

        return response && response.data.code == 1 ? response.data.task : false;
    }

    //回传任务数据给联盟
    async saveTaskData(task_id, task_token, task_data, task_status) {
        let params = {
            name: this.name,
            task_id: task_id,
            task_result: task_data
        };
        if (typeof(task_status) != 'undefined') {
            params.status = task_status;
        }
        params.sign = this.sign(params, task_token);    //对参数进行签名

        let response = null;
        
        try {
            response = await axios.post(this.apis.saveTaskData, params, this.axiosConfig);
        }catch(err) {
            console.error('[ERROR] HeroBot save task data failed: %s, api: %s, params: %s',
                err,
                this.apis.saveTaskData,
                JSON.stringify(params)
            );
        }

        return response ? response.data : false;
    }

}

export default HeroBot;