#!/bin/sh
## spider watcher, work with start_cloud_in_container.sh

script_root=$(dirname $0)
cd $script_root

watcher()
{
    spider_num=`ps -ef | grep 'node spider.mjs' | grep -v grep | wc -l`

    if [ $spider_num -lt 1 ]; then
        echo "Spider is down, try to restart it."

        echo "Checking ulixee cloud"
        cloud_num=`docker ps | grep 'Up ' | grep -v grep | wc -l`
        if [ $cloud_num -ge 1 ]; then
            echo "ulixee cloud is alive, start spider"
            cd $script_root
            npm start -- config_custom.json
        else
            echo "ulixee cloud is down, try to restart it"
            docker stop ulixee_cloud
            docker rm ulixee_cloud
            cd $script_root
            ./start_cloud_in_container.sh
            sleep 10
        fi

    else
        echo "Spider is alive"
        sleep 10
    fi

}

while true; do
    watcher
done
