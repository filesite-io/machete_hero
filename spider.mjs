/**
 * 爬虫主程序
 * 负责监听任务目录里的新任务，并自动抓取数据保存到数据目录。
 * 增加失败任务的重试机制
 * 增加失败任务上报
 * 增加任务处理超时
 */
import getConfigs from './config.mjs';
import common from './lib/common.mjs';
import TaskMoniter from "./lib/taskMoniter.mjs";
import TaJian from "./lib/tajian.mjs";
import HeroBot from "./lib/heroBot.mjs";

import Douyin from './bot/Douyin.mjs';
import Kuaishou from './bot/Kuaishou.mjs';
import Xigua from './bot/Xigua.mjs';
import Bilibili from './bot/Bilibili.mjs';
import WebCrawler from './bot/WebCrawler.mjs';

import cron from 'node-cron';
import path from 'node:path';

(async () => {
    //设置configs为全局变量
    let configFile = '';
    if (process.argv.length >= 3) {
        configFile = process.argv[2];
    }
    global.configs = await getConfigs(configFile);

    const taskMoniter = new TaskMoniter(configs.task_list_dir);
    const tajian = new TaJian(configs.data_save_dir);

    taskMoniter.run();      //监控新任务

    //HeroUnion英雄联盟对接
    let heroUnionConfig = configs.herounion;
    let heroBot = new HeroBot(
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


    //配置本地cloud server地址，cloud安装参考：./install_cloud.sh
    const heroCloudServer = typeof(configs.cloud_server) != 'undefined' && configs.cloud_server ? configs.cloud_server : '';

    //spider run
    let spider_is_running = false,
        last_run_time = 0;
    const task_check_time = 20;     //每 20 秒抓取一次
    const task_auto_run = cron.schedule(`*/${task_check_time} * * * * *`, async () =>  {
        const current_time = common.getTimestampInSeconds();

        //避免同时执行多个爬虫任务，并检查上个任务执行是否超时
        if (spider_is_running == true && current_time - last_run_time < configs.task_do_timeout) {
            return false;
        }

        //随机延迟一段时间，将不同爬虫的执行时间错开
        let rnd_secods = parseInt(Math.random() * task_check_time);
        console.log("Sleep %s seconds before crap...", rnd_secods);
        await common.delay(rnd_secods);


        const task = taskMoniter.getNewTask();
        if (!task) {return false;}

        //标记爬虫开始执行任务
        spider_is_running = true;
        last_run_time = common.getTimestampInSeconds();

        let logFile = path.resolve(configs.task_log_dir) + `/tasks_${heroUnionConfig.name}.log`;
        await common.saveLog(logFile, JSON.stringify(task) + "\n");

        const botName = common.getBotName(task.url);
        console.log('New task %s handle by bot %s, url: %s, cloud server: %s', task.id, botName, task.url, heroCloudServer);
        let bot = null;
        switch (botName) {
            case 'douyin':
                bot = new Douyin(heroCloudServer);
                bot.setMode('mob');     //使用手机模式
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

            default:
                bot = new WebCrawler(heroCloudServer, botName);
                break;
        }

        if (bot) {
            console.log('Spider craping...');

            let taskStarted = taskMoniter.setTaskRunning(task.id);
            const data = await bot.scrap(task.url);
            //console.log('Data got by bot', data);

            if (typeof(data.done) != 'undefined' && data.done == true) {
                task.data = data;        //把抓取到的数据保存到任务里
                taskMoniter.updateTask(task.id, task);

                if (
                    await tajian.saveUrlShortcut(task.id, data)
                    && await tajian.saveDescriptionFiles(task.id, data)
                ) {
                    //马上回传一次数据
                    taskMoniter.notifyHandle(task);

                    //标记任务完成
                    taskMoniter.setTaskDone(task.id);
                }else {
                    taskMoniter.setTaskFailed(task.id);
                }
            }else {
                //失败后最多重试 5 次
                if (typeof(task.fail_retry) == 'undefined') {
                    task.fail_retry = 0;
                }else {
                    task.fail_retry ++;
                }

                taskMoniter.updateTask(task.id, task);

                if (task.fail_retry > configs.max_fail_retry) {
                    taskMoniter.setTaskFailed(task.id);

                    //上报联盟，任务失败
                    heroBot.saveTaskData(task.id, task.token, [], 'failed');
                }else {
                    taskMoniter.setTaskWaiting(task.id);        //重新进入等待处理状态
                }
            }

            spider_is_running = false;
        }else {
            console.error('No bot matched with url %s', task.url);
            spider_is_running = false;
            taskMoniter.setTaskFailed(task.id);
        }
    }, {
        scheduled: false
    });

    task_auto_run.start();
    console.log('[%s] Spider started.', common.getTimeString());


    //爬虫心跳上报
    const heartBeatFrequence = 5;    //5 分钟上报一次
    const heroUnionHeartBeat = cron.schedule(`*/${heartBeatFrequence} * * * *`, async () =>  {
        //随机延迟一段时间，将不同爬虫的执行时间错开
        let rnd_secods = parseInt(Math.random() * 60);
        console.log("Sleep %s seconds before send heart beat...", rnd_secods);
        await common.delay(rnd_secods);

        let status = spider_is_running ? 'busy' : 'idle';
        const res = await heroBot.heartBeat(status);
        console.log('HeroUnion bot heart beat result', res);
    }, {scheduled: false});
    heroUnionHeartBeat.start();

    let heartBeatRes = await heroBot.heartBeat('idle');        //马上上报一次
    console.log('[%s] HeroUnion bot heart beat started.', common.getTimeString(), heartBeatRes);
})().catch(error => {
    console.error("Spider error got:\n%s", error);
    process.exit(1);
});
