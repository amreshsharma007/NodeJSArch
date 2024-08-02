import config from '@/config';
import EmailSequenceJob from '@/jobs/emailSequence';
import Agenda, { JobPriority } from 'agenda';
import LoggerInstance from '@/loaders/logger';

const jobs = async ({ agenda }: { agenda: Agenda }): Promise<void> => {
  await agenda.start();
  LoggerInstance.info('Job instance started');
};

export default jobs;
