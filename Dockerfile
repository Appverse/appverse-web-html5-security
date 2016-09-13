FROM jacobdr/docker-node-phantomjs:2.1.12

RUN git config --global url."https://github.com/".insteadOf "git://github.com/" && \
    echo '{ "allow_root": true }' > ~/.bowerrc

ARG NPM_REGISTRY=https://registry.npmjs.org/
RUN npm config set registry $NPM_REGISTRY
RUN npm install -g bower grunt-cli

WORKDIR /myapp

ADD package.json .
RUN npm install

ADD .bowerrc .
ADD bower.json .
ARG BOWER_REGISTRY=https://bower.herokuapp.com
RUN export bower_registry='$BOWER_REGISTRY'
RUN bower install

ADD . .

RUN npm update
RUN bower update

CMD grunt test:unit
