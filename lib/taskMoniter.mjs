/**
 * 对爬虫任务列表目录进行监控
 * 发现新任务
 * 删除已完成的任务文件
 * 内存中保存所有任务，及其状态
 * 返回当前任务状态
 * -------------------
 * 注意：任务清单文件名不能重复，如果一个新任务文件名跟已经处理过的任务重名，则不会被处理
 * -------------------
 * task数据结构：{id:'', url: '', status:''}
 */
import common from './common.mjs';
import fs from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import cron from 'node-cron';
import HeroBot from "./heroBot.mjs";

class TaskMoniter {
    constructor(task_list_dir) {
        this.check_time_gap = 1;           //检测间隔时间，单位：分钟
        this.notify_time_gap = 5;          //数据回调间隔时间，单位：分钟
        this.checking = false;
        this.notifying = false;

        this.task_dir = task_list_dir;      //监控目录：任务列表保存目录
        this.tasks = {};                    //内存中的任务列表
        this.taskStatus = {                 //当前任务状态
            total: 0,       //总任务数
            waiting: 0,     //等待执行的任务数
            running: 0,     //正在执行的任务数
            done: 0,        //已完成的任务数
            failed: 0       //执行失败的任务数
        };

        this.statusCode = {
            waiting: 'waiting',
            running: 'running',
            done: 'done',
            failed: 'failed',
        };

        //HeroUnion英雄联盟对接
        let heroUnionConfig = configs.herounion;
        this.heroBot = new HeroBot(
                heroUnionConfig.server_url,
                heroUnionConfig.name,
                heroUnionConfig.description,
                heroUnionConfig.platforms,
                heroUnionConfig.contracts,
                heroUnionConfig.country,
                heroUnionConfig.lang,
                heroUnionConfig.contact,
                heroUnionConfig.data_mode
            );
    }

    getTaskFilePath(task_id) {
        const dirPath = path.resolve(this.task_dir);
        return `${dirPath}/${task_id}.task`;
    }

    //注意：任务文件名不能重复，已经用过的文件名不能再使用
    //推荐以时间戳为任务文件名，如：1694762776985.task
    getTaskId(filename) {
        return filename.replace('.task', '');
    }

    getStatus() {
        return this.taskStatus;
    }

    getNewTask() {
        let task = null;

        for (const id in this.tasks) {
            if (this.tasks[id].status == this.statusCode.waiting) {
                task = this.tasks[id];
                break;
            }
        }

        return task;
    }

    setTaskRunning(task_id) {
        if (typeof(this.tasks[task_id]) == 'undefined') {
            return false;
        }

        this.tasks[task_id].status = this.statusCode.running;
        this.tasks[task_id].updated = common.getTimestampInSeconds();
        this.taskStatus[this.statusCode.running] ++;
        this.taskStatus[this.statusCode.waiting] --;

        return true;
    }

    setTaskWaiting(task_id) {
        if (typeof(this.tasks[task_id]) == 'undefined') {
            return false;
        }

        this.taskStatus[this.tasks[task_id].status] --;
        this.tasks[task_id].status = this.statusCode.waiting;
        this.tasks[task_id].updated = common.getTimestampInSeconds();
        this.taskStatus[this.statusCode.waiting] ++;

        return true;
    }

    setTaskDone(task_id) {
        if (typeof(this.tasks[task_id]) == 'undefined') {
            return false;
        }

        this.tasks[task_id].status = this.statusCode.done;
        this.tasks[task_id].updated = common.getTimestampInSeconds();
        this.taskStatus[this.statusCode.done] ++;
        this.taskStatus[this.statusCode.running] --;

        //如果不是联盟的任务，则把本地任务文件删除
        if (typeof(this.tasks[task_id].from) == 'undefined' || this.tasks[task_id].from != 'HeroUnion') {
            const filepath = this.getTaskFilePath(task_id);
            common.removeFile(filepath);        //async delete
        }

        return true;
    }

    setTaskFailed(task_id) {
        if (typeof(this.tasks[task_id]) == 'undefined') {
            return false;
        }

        this.taskStatus[this.tasks[task_id].status] --;
        this.tasks[task_id].status = this.statusCode.failed;
        this.tasks[task_id].updated = common.getTimestampInSeconds();
        this.taskStatus[this.statusCode.failed] ++;

        return true;
    }

    async parseTaskFile(filename, filepath) {
        let task = {};

        try {
            task.id = this.getTaskId(filename);
            task.status = this.statusCode.waiting;
            task.created = common.getTimestampInSeconds();

            task.url = await readFile(filepath, { encoding: 'utf8' });
            if (task.url) {
                task.url = task.url.replace(/[\r\n]/g, '');
            }
        }catch(error) {
            console.error('Get task file content failed: %s', error);
        }

        return task;
    }

    addTask(task) {
        if (typeof(this.tasks[task.id]) != 'undefined') {
            return false;
        }

        this.tasks[task.id] = task;
        this.taskStatus[task.status] ++;
        this.taskStatus.total ++;

        return true;
    }

    updateTask(task_id, task) {
        if (typeof(this.tasks[task.id]) == 'undefined') {
            return false;
        }

        this.tasks[task.id] = task;

        return true;
    }

    //检查新的数据抓取任务
    async checkTasks() {
        if (this.checking == true) {
            return;
        }

        try {
            console.log('[%s] TaskMoniter auto check...', common.getTimeString());

            this.checking = true;

            const dirPath = path.resolve(this.task_dir);
            const files = await readdir(dirPath);
            let task = null, task_id = null;
            for (const filename of files) {
                if (filename.indexOf('.task') === -1) {continue;}       //ignore not *.task files

                task_id = this.getTaskId(filename);
                if (typeof(this.tasks[task_id]) != 'undefined') {       //跳过已经存在的任务
                    continue;
                }

                task = await this.parseTaskFile(filename, `${dirPath}/${filename}`);
                this.addTask(task);
            }

            //从HeroUnion获取任务
            let unionTask = await this.heroBot.getNewTask();
            if (unionTask) {
                console.log('Got new union task %s, url: %s', unionTask.id, unionTask.url);
                unionTask.status = this.statusCode.waiting;
                unionTask.from = 'HeroUnion';    //标记此任务来自联盟
                this.addTask(unionTask);
            }

            this.checking = false;
        }catch(error) {
            this.checking = false;
            console.error('Check tasks failed: %s', error);
        }
    }

    //保存数据到HeroUnion联盟
    //检查已经抓取到数据的任务
    async notifyHandle(task) {
        if (typeof(task.from) == 'undefined' || task.from != 'HeroUnion' || this.notifying) {
            return false;
        }

        //已经完成回传
        if (typeof(task.notified) != 'undefined' && task.notified) {
            return false;
        }

        //判断当前任务数据回传次数是否小于最多尝试次数
        if (typeof(task.notify_time) != 'undefined' && task.notify_time >= configs.herounion.notify_max_try) {
            return false;
        }

        //尝试回传数据
        this.notifying = true;
        let saveRes = await this.heroBot.saveTaskData(task.id, task.token, task.data);
        this.notifying = false;

        if (typeof(task.notify_time) != 'undefined') {
            task.notify_time ++;
        }else {
            task.notify_time = 1;                                //回传次数
        }

        task.notify_at = common.getTimestampInSeconds();     //回传时间戳

        //如果返回数据code=1，则认为数据保存成功，否则过几分钟再次尝试
        if (saveRes && saveRes.code == 1) {
            task.notified = true;                            //记录已经完成回传
            console.log("[%s][%s] Task %s's data save to HeroUnion done",
                    common.getTimeString(), task.notify_time, task.id);
        }else {
            console.error("[%s][%s] Task %s's data save to HeroUnion failed, it will try again later. Error message: %s",
                    common.getTimeString(), task.notify_time, task.id, saveRes.message);
        }

        this.updateTask(task.id, task);                      //更新任务数据
    }

    run() {     //开始监控任务目录，把所有任务缓存到内存
        console.log('[%s] TaskMoniter started.', common.getTimeString());

        //auto check new tasks
        const _self = this;
        const task_check_time = this.check_time_gap;
        const task_auto_run = cron.schedule(`*/${task_check_time} * * * *`, async () =>  {
            await _self.checkTasks();
            console.log('Status', _self.getStatus());
        }, {
            scheduled: false
        });

        task_auto_run.start();
        console.log('[%s] TaskMoniter auto check started.', common.getTimeString());


        //定期向HeroUnion回传任务抓取结果
        const task_notify_time = this.notify_time_gap;
        const notify_auto_run = cron.schedule(`*/${task_notify_time} * * * *`, async () =>  {
            let task = _self.tasks.find((item) => typeof(item.from) != 'undefined' && item.from == 'HeroUnion' && typeof(item.notified) == 'undefined');
            if (task) {
                console.log("[%s] Try to save task %s's data to HeroUnion", common.getTimeString(), task.id);
                await _self.notifyHandle(task);
            }
        }, {
            scheduled: false
        });

        notify_auto_run.start();
        console.log('[%s] TaskMoniter auto notify started.', common.getTimeString());
    }
}

export default TaskMoniter;
