
## 测试脚本

* scrap_test.mjs - 几大平台视频分享网页数据抓取类库测试

使用方法：
```
node scrap_test.mjs "douyin"
```


支持的平台参数：

* douyin
* kuaishou
* xigua
* bilibili


解析结果示例:
```
{
    "done": true,
    "bot": "douyin",
    "title": "一男一女在海上漂了十多天，终于到了一座荒岛，在岛上生活了十年，第一集 #电影解说  #奇幻电影  #爱情 - 抖音",
    "cover": "//p6-pc-sign.douyinpic.com/image-cut-tos-priv/7025cb44422dcaccfc345881233c547e~tplv-dy-resize-origshort-autoq-75:330.jpeg?biz_tag=pcweb_cover&from=3213915784&s=PackSourceEnum_AWEME_DETAIL&sc=cover&se=false&x-expires=2009851200&x-signature=fdARfkxJ0Tyd9UVrBPi4ZvATyZA%3D",
    "cover_type": "jpeg",
    "cover_base64": "/9j/4AAQSkZJRgABA..."
}
```

