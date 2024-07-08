import Agenda, { Job } from 'agenda';
import moment from 'moment';
import { Condition, Mongoose, ObjectId } from 'mongoose';
import { Inject } from 'typedi';
import { Logger } from 'winston';
import JobOptionInterface from '../interfaces/job-option.interface';

export abstract class JobService<T> {
  @Inject('logger') protected logger: Logger;
  @Inject('mongoose') protected mongoose: Mongoose;
  @Inject('agendaInstance') private agenda: Agenda;

  protected _title: string;

  get title(): string {
    return this._title;
  }

  onHandle = async (job: Job): Promise<void> => {
    this.logger.info('');
    this.logger.info('Executing Job: ' + this.title);
    if (!this.title) {
      throw new Error('skipping, because job has no title');
    }

    const opts = job.attrs?.data as JobOptionInterface;

    // check if job is active
    if (opts?.startDate && moment() < moment(opts?.startDate)) {
      return;
    }

    await this.onRun(job, opts?.data as unknown as T, opts);

    this.logger.info('Execution completed successfully');

    /**
     * We will check here if this job has to be stopped
     */
    if (opts?.endDate && moment(opts?.endDate) < moment()) {
      await this.mongoose.connection.db
        .collection(process.env.AGENDA_DB_COLLECTION)
        .updateOne({ _id: job.attrs._id as unknown as Condition<ObjectId> }, {});
    }
  };

  public async remove(): Promise<void> {
    const jobs: Job[] = await this.agenda.jobs({ name: this.title });

    if (jobs && jobs.length > 0) {
      this.logger.info('job already scheduled');

      this.logger.info('removing job...');
      await this.mongoose.connection.db.collection('agendaJobs').deleteMany({ name: this.title });
    }
  }

  public async scheduleIfNot(inputs: T, opts: JobOptionInterface = null): Promise<void> {
    const jobs = await this.agenda.jobs({ name: this.title });

    if (jobs && jobs.length > 0) {
      this.logger.info('job already scheduled');

      if (!opts?.deleteIfExists) {
        return;
      }

      this.logger.info('removing job...');
      await this.mongoose.connection.db.collection('agendaJobs').deleteMany({ name: this.title });
    }

    await this.schedule(inputs, opts);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public async schedule(inputs: T, opts: JobOptionInterface = null): Promise<void> {
    if (!this.title) throw new Error('No title defined, to schedule the job.');

    opts.data = inputs;

    const job: Job = this.agenda.create(this.title, opts);

    if (opts.timeStartAt) job.schedule(opts.timeStartAt);

    if (opts.timeRepeatAt) job.repeatAt(opts.timeRepeatAt);

    if (opts.timeRepeatEvery) job.repeatEvery(opts.timeRepeatEvery);

    // Update Execution time
    // job = job.computeNextRunAt();
    // job.attrs.data.executionDate = job.attrs.nextRunAt;

    await job.save();

    this.logger.info('Jobs is scheduled: ' + this.title);
  }

  protected abstract onRun(job: Job, data: T, opts: JobOptionInterface): Promise<void>;

  protected abstract onFail(job: Job, data: T, opts: JobOptionInterface): Promise<void>;
}
