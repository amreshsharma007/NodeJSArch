export default interface JobOptionInterface {
  cron?: string;
  timeStartAt?: string;
  timeRepeatAt?: string;
  timeRepeatEvery?: string;

  startDate: Date;
  endDate?: Date;

  data?: unknown;

  deleteIfExists?: boolean;
}
