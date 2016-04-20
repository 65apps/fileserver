FROM debian:jessie
MAINTAINER Andrey Ivanov stayhardordie@gmail.com

ENV DIR=/srv
ENV NODE_REPOSITORY=https://nodejs.org/dist/v4.4.1/node-v4.4.1.tar.gz
ENV REPOSITORY=https://github.com/65apps/fileserver.git
ENV DIR_FILES=/mnt/files

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    nano \
    python \
    libssl-dev \
    wget \
    git

WORKDIR $DIR

RUN mkdir $DIR_FILES

RUN wget $NODE_REPOSITORY && \
    tar -xzf node-v4.4.1.tar.gz && \
    rm -rf node-v4.4.1.tar.gz && \
    cd node-v4.4.1 && \
    ./configure && \
    make && make install && \
    rm -rf ../node-v4.4.1

WORKDIR $DIR

RUN git clone $REPOSITORY && \
    cd fileserver && \
    npm install

EXPOSE 8080

WORKDIR $DIR/fileserver

CMD ["npm", "start"]


