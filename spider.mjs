/**
 * 爬虫主程序
 * 负责监听任务目录里的新任务，并自动抓取数据保存到数据目录。
 */
import configs from './config.mjs';
import common from './lib/common.mjs';
import TaskMoniter from "./lib/taskMoniter.mjs";
import TaJian from "./lib/tajian.mjs";

import Douyin from './bot/Douyin.mjs';
import Kuaishou from './bot/Kuaishou.mjs';
import Xigua from './bot/Xigua.mjs';
import Bilibili from './bot/Bilibili.mjs';

import cron from 'node-cron';

(async () => {

    const taskMoniter = new TaskMoniter(configs.task_list_dir);
    const tajian = new TaJian(configs.data_save_dir);

    taskMoniter.run();      //监控新任务


    const heroCloudServer = 'ws://192.168.3.13:1818';

    //spider run
    let spider_is_running = false;
    const task_check_time = 20;     //每 20 秒抓取一次
    const task_auto_run = cron.schedule(`*/${task_check_time} * * * * *`, async () =>  {
        if (spider_is_running == true) {return false;}      //避免同时执行多个爬虫任务

        const task = taskMoniter.getNewTask();
        if (!task) {return false;}

        const botName = common.getBotName(task.url);
        console.log('New task %s handle by bot %s.', task.url, botName);
        let bot = null;
        switch (botName) {
            case 'douyin':
                bot = new Douyin(heroCloudServer);
                break;
            case 'kuaishou':
                bot = new Kuaishou(heroCloudServer);
                break;
            case 'xigua':
                bot = new Xigua(heroCloudServer);
                break;
            case 'bilibili':
                bot = new Bilibili(heroCloudServer);
                break;
        }

        if (bot) {
            spider_is_running = true;

            taskMoniter.setTaskRunning(task.id);
            const data = await bot.scrap(task.url);
            //console.log('Data got by bot', data);

            if (typeof(data.done) != 'undefined' && data.done == true) {
                if (
                    await tajian.saveUrlShortcut(task.id, data)
                    && await tajian.saveDescriptionFiles(task.id, data)
                ) {
                    taskMoniter.setTaskDone(task.id);
                }else {
                    taskMoniter.setTaskFailed(task.id);
                }
            }else {
                taskMoniter.setTaskFailed(task.id);
            }

            spider_is_running = false;
        }else {
            console.error('No bot matched with url %s', task.url);
            taskMoniter.setTaskRunning(task.id);
            taskMoniter.setTaskFailed(task.id);
        }
    }, {
        scheduled: false
    });

    task_auto_run.start();
    console.log('[%s] Spider started.', common.getTimeString());

})().catch(error => {
  console.error("Spider error got:\n%s", error);
  process.exit(1);
});
