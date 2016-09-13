FROM jacobdr/docker-node-phantomjs:2.1.12

RUN git config --global url."https://github.com/".insteadOf "git://github.com/" && \
    echo '{ "allow_root": true }' > /root/.bowerrc && \
    npm install -g bower grunt-cli

WORKDIR /myapp

ADD package.json .
RUN npm install

ADD .bowerrc .
ADD bower.json .
RUN bower install

ADD . .

RUN npm update
RUN bower update

CMD grunt test:unit
