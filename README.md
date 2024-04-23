# machete的hero爬虫脚本库

Hero scripts of machete.

本项目基于Node.js和开源工具Hero（[Ulixee官网](https://ulixee.org)）。


支持以下平台视频分享网页数据抓取：

* 抖音网页版
* 快手网页版
* 西瓜视频网页版
* Bilibili


爬虫采集到的数据结构见Machete项目的TaJian皮肤文档，目前实现了以下几个属性：

* 视频标题
* 视频封面图（含图片网址和base64格式数据）


## 目录/文件说明

* bot - 针对各大平台的网页HTML解析类
* bypass - 针对各大平台的常用域名收集
* lib - 公用类
* plugin - Hero插件
* data - TaJian爬虫数据保存目录
* todo - TaJian爬虫任务保存目录
* test - 类库测试代码
* tmp - 临时文件保存目录
* install_cloud.sh - hero服务端安装（非必需）
* install_hero.sh - hero客户端安装
* config.mjs - 爬虫配置文件
* spider.mjs - TaJian爬虫主程序


## 使用方法

1. 下载本源码到本地后，进入项目根目录
```
git clone "https://git.filesite.io/filesite/machete_hero.git"
cd machete_hero/
```


2. 执行下面命令安装依赖包
```
npm install
```

如果你对npm和node不熟悉，请自行了解。


3. 执行下面命令启动爬虫
```
npm start
```

带参数启动，设置自定义配置文件，覆盖默认的config.mjs
```
npm start -- config_custom.json
```

在目录todo/里创建任务文件，爬虫检测到新任务后自动抓取数据并保存到data/目录下。


4. 二次开发

写一个.mjs脚本，调用bot/下的类库，实现目标网页访问和解析获取所需数据。

还可以参考bot/下的类库，实现对任意网站的数据抓取。

bot/目录下的类库调用方法，可参考test/scrap_test.mjs测试脚本，
测试脚本使用方法见test/README.md文档。
