'use strict';
import LoggerInstance from '@/loaders/logger';
import { Docker } from 'node-docker-api';

const deploy = async () => {
  const docker = new Docker({ socketPath: '/var/run/docker.sock' });

  const list = await docker.container.list();

  LoggerInstance.info(list);

  // docker.container
  //   .create({
  //     Image: 'node:20-alpine',
  //     name: 'test',
  //   })
  //   .then(container => container.start())
  //   .then(container => container.stop())
  //   .then(container => container.restart())
  //   .then(container => container.delete({ force: true }))
  //   .catch(error => LoggerInstance.error(error));
};

deploy().then(r => {});
