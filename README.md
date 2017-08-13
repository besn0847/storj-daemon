# Storj Daemon

For more details, refer to : https://github.com/seedbloom/docker-storj

To generate a new config.json file:
```bash
storjshare-create --storj 0xa7c2863f3c62dad2ce0da1d64e400594b52c041d --storage /data --size 10GB --outfile /data/config.json --rpcaddress 77570.besnard.mobi --rpcport 4000 --manualforwarding true --logdir /data/logs/ --noedit
```

To start a container to generate the new config file:
```bash
docker run -ti --rm --entrypoint /bin/ash storj-daemon
```

To launch the Storj daemon container: 
```bash
docker run -d --name storjd --restart=always -p 4000:4000 -p 4001:4001 -p 4002:4002 -p 4003:4003 -v /mnt/sdb1/Storj/:/data storj-daemon
```
