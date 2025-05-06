#!/bin/sh

docker run  --rm -v `pwd`/cluster.hocon:/opt/emqx/data/configs/cluster.hocon \
  --add-host=host.docker.internal:host-gateway \
  -v `pwd`/api-keys:/mounted/config/api-keys \
  -v `pwd`/acl.conf:/opt/emqx/data/authz/acl.conf \
  -p 4880:1883 -p 4881:8083 -p 9083:18083 --name emqx emqx/emqx:5.8.0 