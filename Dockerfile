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
ADD config.json /etc/

EXPOSE 30400
EXPOSE 30401
EXPOSE 30402
EXPOSE 30403

CMD storjshare daemon && storjshare start --config /etc/config.json && while(true); do sleep 30; done
