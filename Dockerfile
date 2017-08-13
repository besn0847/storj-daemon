FROM node:boron-alpine

RUN apk add --no-cache bash g++ git make openssl-dev python vim && \
	node --version && \
	npm --version && \
	python --version && \
	npm install --global storjshare-daemon && \
	npm install --global storj-lib && \
	npm cache clean && \
	apk del git openssl-dev python vim && \
	rm -rf /var/cache/apk/* && \
	rm -rf /tmp/npm* && \
	storjshare --version

RUN mkdir /data 

ADD Storj_Farmer_Contracts.js /usr/lib/

EXPOSE 4000
EXPOSE 4001
EXPOSE 4002
EXPOSE 4003

CMD storjshare start -d --config /data/config.json  
