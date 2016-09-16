FROM appverse/docker-appverse-html5-buildpack

ARG NPM_REGISTRY=https://registry.npmjs.org/
RUN npm config set registry $NPM_REGISTRY

WORKDIR /myapp

ADD package.json .
RUN npm config set progress false && \
    npm install --quiet

ADD .bowerrc .
ADD bower.json .
ARG BOWER_REGISTRY=https://bower.herokuapp.com
ENV bower_registry $BOWER_REGISTRY
RUN bower install

ADD . .

RUN npm update --quiet && \
    bower update

CMD grunt test:unit
