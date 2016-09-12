FROM jacobdr/docker-node-phantomjs:2.1.12

RUN git config --global url."https://github.com/".insteadOf "git://github.com/" && \
    echo '{ "allow_root": true }' > /root/.bowerrc && \
    npm install -g bower grunt-cli

WORKDIR /myapp
ADD . /myapp

RUN npm install && \
    bower install

CMD grunt test:unit
