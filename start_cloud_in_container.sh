#!/bin/bash
## start ulixee cloud in docker container
## you should pull it's docker image before run this script
## docker pull ulixee/ulixee-cloud

current_path=$(dirname $0)
cd $current_path

## Configure the PORT ulixee will run on
port="${PORT:=1818}"
## Enable verbose logs
DEBUG=ulx*
## NOTE: these are unix oriented. adjust as needed for Windows
DATASTORES_MOUNT=$HOME/.cache/ulixee/datastores
DATADIR_MOUNT=/tmp/.ulixee

mkdir -p $DATASTORES_MOUNT
mkdir $DATADIR_MOUNT

chmod 777 $DATASTORES_MOUNT
chmod 777 $DATADIR_MOUNT

# To add an environment configuration file:
# `--env-file ./.env`
# All environment configurations can be found at: `cloud/main/.env.defaults`
docker run -itd --init \
    --name ulixee_cloud \
    --ipc=host \
    --user ulixee \
    --restart unless-stopped \
    --sysctl net.ipv4.tcp_keepalive_intvl=10 \
    --sysctl net.ipv4.tcp_keepalive_probes=3 \
    --log-opt max-size=50m --log-opt max-file=3 \
    --log-driver local \
    -v $DATASTORES_MOUNT:/home/ulixee/.cache/ulixee/datastores \
    -v $DATADIR_MOUNT:/tmp/.ulixee \
    -p "$port:$port" \
    -e DEBUG=$DEBUG \
    -e DISPLAY=:99 \
    ulixee/ulixee-cloud:latest \
    xvfb-run npx @ulixee/cloud start --port=${port}
