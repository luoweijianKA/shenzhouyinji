Docker 部署

1、创建网络
docker network create [name]

2、将容器加入已有网络
docker network connect [net-name] [containers-name]

3、查看网络情况
docker network inspect [net-name]
docker network inspect szyj-net

4、部署 Mysql & Mongodb
docker run -itd --network szyj-net --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=U8c3@47di mysql

    docker run -itd --network szyj-net --name mongo -p 27017:27017 mongo

    sudo docker run -itd --network szyj-net --name mongo -p 37951:27017 mongo --auth
    sudo docker exec -it mongo mongosh admin
    db.createUser({ user:'admin',pwd:'U8d5c33',roles:[ { role:'userAdminAnyDatabase', db: 'admin'},"readWriteAnyDatabase"]});
    db.auth('admin', 'U8d5c33');

    mongodb://admin:U8d5c33@159.75.224.4:37951/?retryWrites=true&w=majority

5、启动容器时加入网络
network：[net-name]
--network szyj-net

6、部署 consul

sudo docker run
-d
-p 8500:8500
-p 8600:8600/udp
--name=consul
--network szyj-net
--ip 172.18.0.6
--restart unless-stopped
consul agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0

7、构建镜像时的命令

    Gateway:
    docker build --build-arg DB_URI_VALUE='mongodb://172.18.0.12:27017/?retryWrites=true&w=majority' --build-arg DB_NAME_VALUE='shenzhouyinji' --build-arg CONSUL_REG_ADDRESS_VALUE='172.18.0.6:8500' --build-arg WECHAT_APPID_VALUE='wx26015bd50dfdd836' --build-arg WECHAT_SECRET_VALUE='b8ad226ffe37c73231929faeb8eb5075' -t gatewayservice .

    Gateway 正式：

    APPID="wx2b36c7777353cd2e"
    SECRET="8a7bca23c18dbc558ae623ba89041699"

    sudo docker build --build-arg DB_URI_VALUE='mongodb://172.18.0.12:27017/?retryWrites=true&w=majority' --build-arg DB_NAME_VALUE='shenzhouyinji' --build-arg CONSUL_REG_ADDRESS_VALUE='172.18.0.6:8500' --build-arg WECHAT_APPID_VALUE='wx2b36c7777353cd2e' --build-arg WECHAT_SECRET_VALUE='8a7bca23c18dbc558ae623ba89041699' -t gatewayservice .

    Account:
    sudo docker build --build-arg DB_SOURCE_VALUE="root:U8c3@47di@tcp(172.18.0.4:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t accountservice .

    Event:
    sudo docker build --build-arg DB_SOURCE_VALUE="root:U8c3@47di@tcp(172.18.0.4:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t eventservice .

    Management:
    sudo docker build --build-arg DB_SOURCE_VALUE="root:U8c3@47di@tcp(172.18.0.4:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t managementservice .

    Message:
    sudo docker build --build-arg DB_SOURCE_VALUE="root:U8c3@47di@tcp(172.18.0.4:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t messageservice .

    Sceneryspot:
    sudo docker build --build-arg DB_SOURCE_VALUE="root:U8c3@47di@tcp(172.18.0.4:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t sceneryspotservice .

    Task:
    sudo docker build --build-arg DB_SOURCE_VALUE="root:U8c3@47di@tcp(172.18.0.4:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t taskservice .

8、 部署 service
sudo docker run -d -p 8088:8080 --network szyj-net --name=gateway -v /home/static/resources:/resources:rw --privileged=true gatewayservice
-- sudo docker run -d -p 8088:8080 --network szyj-net gatewayservice

sudo docker run -d --network szyj-net --name=account accountservice
sudo docker run -d --network szyj-net --name=event eventservice
sudo docker run -d --network szyj-net --name=management managementservice
sudo docker run -d --network szyj-net --name=message messageservice
sudo docker run -d --network szyj-net --name=sceneryspot sceneryspotservice
sudo docker run -d --network szyj-net --name=task taskservice

Dashboard:
docker run -d --network szyj-net --restart unless-stopped --name dashboard -p 8082:80 -v $PWD/build:/usr/share/nginx/html:ro -v $PWD/nginx/nginx.conf:/etc/nginx/nginx.conf:ro -v $PWD/nginx/conf.d:/etc/nginx/conf.d:ro nginx

Static:
docker run -d --network szyj-net --restart unless-stopped --name static -p 8081:80 -v $PWD/resources:/usr/share/nginx/html:ro -v $PWD/nginx/nginx.conf:/etc/nginx/nginx.conf:ro -v $PWD/nginx/conf.d:/etc/nginx/conf.d:ro nginx

Nginx:
sudo docker run -d --network szyj-net --name nginx -p 443:443 -p 80:80 -v /home/nginx/html:/usr/share/nginx/html:rw -v /home/nginx/nginx.conf:/etc/nginx/nginx.conf:rw -v /home/nginx/conf.d:/etc/nginx/conf.d:rw -v /home/nginx/logs:/var/log/nginx:rw -v /home/nginx/ssl:/etc/nginx/ssl:rw --privileged=true nginx

Doc:
docker run -d --network szyj-net --restart unless-stopped --name doc -p 8083:80 -v $PWD/book:/usr/share/nginx/html --privileged=true nginx

常用命令：
sudo docker container ls
sudo docker images

    sudo docker system df
    sudo docker builder prune -a

    sudo docker logs -f -t`<container>`
    sudo docker exec -it `<container>` /bin/bash
    sudo docker exec -it `<container>` /bin/sh
    sudo docker container attach `<container>`

    sudo docker commit -p`<container id>` `<image name>`
    sudo docker save -o `<file name>` `<image name>`

腾讯云

MySQL 实例
172.16.0.10:3306 root / U8c3@47di

address：gz-cdb-dt4dwvqj.sql.tencentcdb.com
port：63834
user：root
password：U8c3@47di

CREATE USER 'szyj'@'172.16.0.2' IDENTIFIED BY 'J83df@z0Dk';
GRANT EXECUTE, DELETE, INSERT, UPDATE, SELECT ON shenzhouyinji.\* TO 'szyj'@'172.16.0.2';
FLUSH PRIVILEGES;

    APPID="wx2b36c7777353cd2e"
    SECRET="8a7bca23c18dbc558ae623ba89041699"
    DB_SOURCE_VALUE="szyj:J83df@z0Dk@tcp(172.16.0.10:3306)/shenzhouyinji"

https://aip.shenzhouyinji.cn/playground

构建容器
Gateway：
sudo docker build --build-arg DB_URI_VALUE='mongodb://admin:U8d5c33@172.18.0.12:27017/?retryWrites=true&w=majority' --build-arg DB_NAME_VALUE='shenzhouyinji' --build-arg CONSUL_REG_ADDRESS_VALUE='172.18.0.6:8500' --build-arg WECHAT_APPID_VALUE='wx2b36c7777353cd2e' --build-arg WECHAT_SECRET_VALUE='8a7bca23c18dbc558ae623ba89041699' -t gatewayservice .

    Account:
    sudo docker build --build-arg DB_SOURCE_VALUE="szyj:J83df@z0Dk@tcp(172.16.0.10:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t accountservice .

    Event:
    sudo docker build --build-arg DB_SOURCE_VALUE="szyj:J83df@z0Dk@tcp(172.16.0.10:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t eventservice .

    Management:
    sudo docker build --build-arg DB_SOURCE_VALUE="szyj:J83df@z0Dk@tcp(172.16.0.10:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t managementservice .

    Message:
    sudo docker build --build-arg DB_SOURCE_VALUE="szyj:J83df@z0Dk@tcp(172.16.0.10:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t messageservice .

    Sceneryspot:
    sudo docker build --build-arg DB_SOURCE_VALUE="szyj:J83df@z0Dk@tcp(172.16.0.10:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t sceneryspotservice .

    Task:
    sudo docker build --build-arg DB_SOURCE_VALUE="szyj:J83df@z0Dk@tcp(172.16.0.10:3306)/shenzhouyinji" --build-arg CONSUL_REG_ADDRESS_VALUE="172.18.0.6:8500" -t taskservice .

部署 service
sudo docker run -d -p 8088:8080 --network szyj-net --name=gateway -v /home/static/resources:/resources:rw --privileged=true gatewayservice
sudo docker run -d --network szyj-net --name=account accountservice
sudo docker run -d --network szyj-net --name=event eventservice
sudo docker run -d --network szyj-net --name=management managementservice
sudo docker run -d --network szyj-net --name=message messageservice
sudo docker run -d --network szyj-net --name=sceneryspot sceneryspotservice
sudo docker run -d --network szyj-net --name=task taskservice
