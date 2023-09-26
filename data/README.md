
## 视频网页抓取数据保存目录

按照FileSite.io的.url快捷方式文件格式保存，
并把相关数据以.txt描述文件保存。

示例如下：

文件名：20230913001.url

文件内容：
```
[InternetShortcut]
URL=https://v.ixigua.com/ieUaqrFN/
```

标题描述文件20230913001_title.txt：
```
漂亮妻子留守农村，好心丈夫托人过来帮忙，不料竟引发悲剧，影视 - 西瓜视频
```

标题描述文件20230913001_cover.txt：
```
http://p26-sign.bdxiguaimg.com/tos-cn-i-0004/ogB8EBP9dzAj3PApA2fDAIyACAbQuBpSIBN8Wh~tplv-pk90l89vgd-crop-center:864:486.jpeg?appId=1768&channelId=0&customType=custom%2Fnone&from=704_large_image_list&imageType=video1609&isImmersiveScene=0&is_stream=0&logId=202309132134234286F774B5273B4C0A5F&requestFrom=704&x-expires=1726148064&x-signature=ReDy6AL8DMvD7YsUrl%2F%2Bl2wb6Ls%3D
```

考虑到图片网址可能会有实效性，自动抓取程序将把它下载下来保存为：20230913001.jpg，
则封面图描述文件20230913001_cover.txt内容为：
```
20230913001.jpg
```

