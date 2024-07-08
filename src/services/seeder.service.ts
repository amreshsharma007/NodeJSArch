import { Inject } from 'typedi';
import { Logger } from 'winston';
import { Faker, LocaleDefinition } from '@faker-js/faker';

export default abstract class SeederService<T> {
  @Inject('logger') protected logger: Logger;

  protected constructor() {
    this.faker = new Faker({ locale: {} as LocaleDefinition });
  }

  private _faker: Faker;

  get faker(): Faker {
    return this._faker;
  }

  set faker(value: Faker) {
    this._faker = value;
  }

  private _isEntryPromise: boolean;

  get isEntryPromise(): boolean {
    return this._isEntryPromise;
  }

  //Set if Entry creation Executable promise
  set isEntryPromise(value: boolean) {
    this._isEntryPromise = value;
  }

  private _entries: T[];

  get entries(): T[] {
    return this._entries;
  }

  set entries(value: T[]) {
    this._entries = value;
  }

  private static async createEntry(model, data) {
    return await model.create(data);
  }

  abstract numItems(): number;

  abstract onCreated(entry): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract getModel(): any;

  abstract beforeEach(index: number): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract getData(): Promise<void>;

  abstract beforeStart(options: object): Promise<void>;

  abstract createEntryPromise(index: number);

  abstract success(): Promise<boolean>;

  abstract error(): Promise<boolean>;

  startSeed = async (
    numberItems: number,
    beforeStart: () => Promise<void>,
    success: () => Promise<void>,
    error: () => Promise<void>,
    options: object = null,
  ) => {
    this.logger.info('');
    this.logger.info('');
    this.logger.info('Running Seeder with ' + this.constructor.name);

    const totalNoItems = numberItems || this.numItems();
    this.logger.info('Total ' + totalNoItems + ' items has to be seeded');
    if (!this.getModel()) {
      throw new Error('No Model Found to create entry');
    }
    try {
      if (this.beforeStart(options)) {
        await this.beforeStart(options);
      }
      if (beforeStart) {
        await beforeStart();
      }

      /**
       * Clear the entries
       */
      this.entries = [];
      for (let index = 0; index < totalNoItems; index++) {
        await this.beforeEach(index);
        if (this.isEntryPromise) {
          const entryCreate = await this.createEntryPromise(index);
          if (!entryCreate) {
            this.logger.error('Error Creating entry');
          }
        } else {
          const entry = await SeederService.createEntry(this.getModel(), await this.getData());
          if (!entry) {
            this.logger.error('Error Creating entry');
            continue;
          }
          /**
           * Push the entry to
           * _entry array
           */
          this.entries.push(entry);

          /**
           * Hit the callback
           * that entry is the created
           */
          await this.onCreated(entry);
        }
      }
      this.logger.info('Successfully Seeded, seeder = ' + this.constructor.name);

      if (await this.success()) {
        await this.success();
      }
      if (success) {
        await success();
      }
    } catch (error_) {
      this.logger.error('Error occurred in seeder: ' + this.constructor.name);
      this.logger.error(error_);

      if (this.error()) {
        await this.error();
      }
      if (error) {
        await error();
      }
    }
    return this.entries;
  };
}
