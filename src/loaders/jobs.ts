import config from '@/config';
import EmailSequenceJob from '@/jobs/emailSequence';
import Agenda, { JobPriority } from 'agenda';
import LoggerInstance from '@/loaders/logger';

const jobs = ({ agenda }: { agenda: Agenda }): void => {
  agenda.define(
    'send-email',
    { priority: JobPriority?.high, concurrency: config.agenda.concurrency },
    // @TODO Could this be a static method? Would it be better?
    new EmailSequenceJob().handler,
  );

  agenda.start().then(r => {
    LoggerInstance.info('Job instance started');
  });
};

export default jobs;
