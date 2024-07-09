import { Request } from 'express';
import _ from 'lodash';
import { Logger } from 'winston';
import { Container, Inject } from 'typedi';
import { ClientSession, Document, FilterQuery, Model, Mongoose, SaveOptions } from 'mongoose';
// import { ObjectId } from 'bson';
import { MongooseOptionInterface } from '@/interfaces/mongoose-option.interface';

/**
 * Default ABSTRACT class: CrudService
 * this class will be used as base class
 * to create all the crud service around the project
 *
 * Note: We're using keyword object in this file as this required as abstract class
 */
export default abstract class CrudService<T, U> {
  abstract groupDBFields: unknown;
  @Inject('mongoose') public mongoose: Mongoose;

  /**
   * Projections Mapping Only
   * This will be used in MongoDB Query
   */
  abstract projections: unknown;
  protected idFieldPrefix = '';
  protected primaryKey = 'crudId';
  protected primaryValueLength = 5;
  protected primaryValueSeparator = '';
  @Inject('logger') protected logger: Logger;
  protected _defaultModel: Model<Document>;

  /**
   * This is Actually Array of strings
   * This will be just a reference to mapping
   *
   * This will be used in filtering the projection fields/columns
   */
  protected defaultProjections = [];
  protected _count = 0;

  private _itemsPerPage = 10;

  get itemsPerPage(): number {
    return this._itemsPerPage;
  }

  /**
   * This function must be static
   * neither it won't work
   *
   * @param doc
   * @param ret
   * @param options
   */
  public static modifyMongooseDoc = (doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;

    return ret;
  };

  public static MongoosePreSave = doc => {};

  public getProjections = () => {
    const tempProjections = this.projections;
    delete tempProjections['_id'];
    return tempProjections;
  };

  public prepareCrudListAsObject<T>(list: Document[]): T[] {
    const result = [] as T[];

    try {
      for (const item of list) {
        result.push(item.toObject() as unknown as T);
      }
    } catch (error) {
      this.logger.error(error);
    }

    return result;
  }

  /**
   * Well, usually mongoose handles this conversion
   * i.e. this string to ObjectId conversion
   * but in case of pipelines in aggregation it doesn't
   * in that case, we have to convert it manually
   *
   * so, this function exists
   * please use this to convert the string id to ObjectId
   *
   * @param id
   */
  public createMongooseObjectId(id: string) {
    if (typeof id !== 'string') return id;
    return new this.mongoose.Types.ObjectId(id);
  }

  /**
   * Prepare projection
   * for Dates
   *
   * @param dateField
   * @param returnTime
   */
  public dateStringProject(dateField: string, returnTime = true) {
    if (!returnTime) {
      return {
        $concat: [
          { $toLower: { $dayOfMonth: dateField } },
          '-',
          { $toLower: { $month: dateField } },
          '-',
          { $toLower: { $year: dateField } },
          '\t',
        ],
      };
    }

    return {
      $concat: [
        { $toLower: { $dayOfMonth: dateField } },
        '-',
        { $toLower: { $month: dateField } },
        '-',
        { $toLower: { $year: dateField } },
        ' ',
        { $toLower: { $hour: dateField } },
        ':',
        { $toLower: { $minute: dateField } },
        ':',
        { $toLower: { $second: dateField } },
        '\t',
      ],
    };
  }

  public async findRandomEntry<T>(filters: Record<string, unknown> = {}): Promise<T> {
    // Null check for the default Model
    if (!this._defaultModel) return;

    // Get a random entry
    const count: number = await this._defaultModel.countDocuments(filters);

    const random: number = Math.floor(Math.random() * count);

    // Again query all users but only fetch one offset by our random #
    return (await this._defaultModel.findOne(filters).skip(random)) as unknown as T;
  }

  public async initiateIndex() {
    const collectionName = this._defaultModel.collection.collectionName;

    // Delete all entries of sequence entry
    await this.mongoose.connection.db.collection(collectionName).deleteMany({
      type: 'sequenceEntry',
    });

    // insert a new entry of sequence entry
    // await this.mongoose.connection.db.collection(collectionName).insertOne({
    //   type: 'sequenceEntry',
    //   sequenceValue: 0,
    //   date: new Date(),
    // } as CrudIndexEntryInterface);
  }

  /**
   * Use the following functions as information merger in a object
   * in a way that can be used in MongoDB to search the query
   *
   * @param filters
   * @param wildCardSearch
   * @param dateFrom
   * @param dateTo
   */
  abstract prepareFilters(
    filters: Record<string, unknown>,
    wildCardSearch: string,
    dateFrom: Date | string, //moment.Moment,
    dateTo: Date | string, //moment.Moment
  );

  abstract prepareAggregation<T = unknown>(
    req: Request,
    // eslint-disable-next-line @typescript-eslint/ban-types
    filters: Record<string, unknown>,
    wildCardSearch: string,
    dateFrom: Date,
    dateTo: Date,
    projections?: _.Dictionary<T>,
    virtualConditional?: Partial<U>,
  );

  abstract count(
    req: Request,
    filters: Record<string, unknown>,
    wildCardSearch: string,
    dateFrom: Date, //moment.Moment,
    dateTo: Date, //moment.Moment
    virtualConditional?: Partial<U>,
  );

  abstract sum(
    req: Request,
    filters: Record<string, unknown>,
    wildCardSearch: string,
    dateFrom: Date,
    dateTo: Date,
    baseKey: string,
    sumKey: string,
  );

  abstract find(
    req: Request,
    filters: Record<string, unknown>,
    wildCardSearch: string,
    dateFrom: Date | string, //moment.Moment,
    dateTo: Date | string, //moment.Moment,
    page: number,
    itemsPerPage: number,
    project: string[],
    saveOptions: SaveOptions,
    virtualConditional: Partial<U>,
    isStreaming: boolean,
  );

  abstract findAndCount(
    req: Request,
    filters: FilterQuery<T>,
    wildCardSearch: string,
    dateFrom: Date,
    dateTo: Date,
    page: number,
    itemsPerPage: number,
    projections: string[],
    virtualConditional?: Partial<U>,
  ): Promise<{
    totalData: T[];
    totalCount: number;
  }>;

  abstract getRandomEntry();

  abstract generateNewId();

  abstract findOne(req: Request, filters: Record<string, unknown>, project: string[], saveOptions: SaveOptions);

  abstract findOneOrCreate(
    req: Request,
    filters: Record<string, unknown>,
    inputs: Record<string, unknown>,
    saveOptions: SaveOptions,
  );

  abstract findOneAndUpdate(
    req: Request,
    filters: Record<string, unknown>,
    inputs: Record<string, unknown>,
    saveOptions: SaveOptions,
  );

  abstract update(
    req: Request,
    filters: Record<string, unknown>,
    inputs: Record<string, unknown>,
    mongooseOption: MongooseOptionInterface,
    ...args: Record<string, unknown>[]
  );

  abstract create(
    req: Request,
    inputs: Record<string, unknown>,
    saveOptions: SaveOptions,
    ...args: Record<string, unknown>[]
  );

  abstract createMultiple(
    req: Request,
    inputs: Record<string, unknown>[],
    saveOptions: SaveOptions,
    ...args: Record<string, unknown>[]
  );

  abstract delete(req: Request, filters: Record<string, unknown>, saveOptions: SaveOptions);

  protected updateDefaultModel(model: unknown) {
    this._defaultModel = model as Model<Document>;
  }

  /**
   * Prepare projection
   * @param projections
   */
  protected prepareProjections = (projections: string[] = []) => {
    let result: string[];

    // Remove the default _id
    if (projections && projections.includes('_id')) {
      projections.splice(projections.indexOf('_id'), 1);
    }

    // Apply filter of the projections provided
    if (projections && projections.length > 0) {
      result = _.filter(projections, key => _.includes(Object.keys(this.projections), key));
    }

    // If result is empty, then apply the default projection
    if (!result || result.length === 0) {
      result = this.defaultProjections;
    }

    // Restore field _id
    result.push('_id');

    return _.pickBy(this.projections as Record<string, unknown>, (value, key) => {
      return _.includes(result, key);
    });
  };

  protected prepareFilterIds(filter: Record<string, unknown>, keys: string[]) {
    const _keys = Object.keys(filter).filter(_key => keys.includes(_key));
    if (!_keys || _keys.length === 0) return;

    for (const k of _keys) {
      filter[k] = this.createMongooseObjectId(filter[k] as string);
    }

    /**
     * Special handling for id
     */
    if (filter['id']) {
      filter['_id'] = filter['id'];
      delete filter['id'];
    }
  }

  protected filterObjectKeys = <T>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    inputObj: object,
    keys: string[] = [],
    keepId = true,
  ): T => {
    keys = keys.filter(item => {
      return item != '_id' || keepId;
    });

    return (
      Object.keys(inputObj)
        .filter(key => keys.includes(key))
        // eslint-disable-next-line unicorn/no-array-reduce
        .reduce((obj, key) => {
          obj[key] = inputObj[key];
          return obj;
        }, {}) as T
    );
  };

  protected prepareDateFilterAggregation(dateFrom: Date, dateTo: Date): Record<string, unknown> {
    const result = {};

    if (dateFrom != null) {
      if (!result['createdAt']) {
        result['createdAt'] = {};
      }
      result['createdAt']['$gte'] = new Date(dateFrom);
    }

    if (dateTo != null) {
      if (!result['createdAt']) {
        result['createdAt'] = {};
      }

      const date: Date = new Date(dateTo);
      result['createdAt']['$lte'] = new Date(date.setDate(date.getDate() + 1));
    }

    return result;
  }

  /**
   * Initiates a mongoose session with mongoose library
   * and start the transaction we well
   * Here, we don't need to call startTransaction method,
   * but only we have to call commit or abort transaction
   *
   * @param saveOptions
   * @protected
   */
  protected async startSessionTransaction(saveOptions: SaveOptions = {}): Promise<ClientSession> {
    // Initiate the session object variable
    let session!: ClientSession;

    if (saveOptions && saveOptions.session) {
      session = saveOptions.session;
    }

    if (!session) {
      this.logger.info('Starting new session...');
      const mongoose = (await Container.get('mongoose')) as Mongoose;
      session = await mongoose.startSession();
    }

    if (!session.inTransaction()) session.startTransaction();

    return session;
  }

  /**
   * End the transaction conditionally
   * And the condition is that saveOption or saveOption's session
   * must be empty in order to mark the session ended
   * it is because we have to mark only those sessions which has been initiated by function itself
   *
   * @param session
   * @param saveOptions
   * @protected
   */
  protected async endSessionTransaction(session: ClientSession, saveOptions: SaveOptions = {}): Promise<void> {
    if (!saveOptions || !saveOptions.session) {
      this.logger.info('Ending session');
      return session.endSession();
    }
  }

  protected async commitSessionTransaction(session: ClientSession, saveOptions: SaveOptions = {}): Promise<void> {
    if (!saveOptions || !saveOptions.session) {
      this.logger.info('Committing Transaction...');
      return session.commitTransaction();
    }
  }

  protected async abortSessionTransaction(
    session: ClientSession,
    saveOptions: SaveOptions = {},
    error: Error = null,
  ): Promise<void> {
    if (!saveOptions || !saveOptions.session) {
      try {
        /**
         * No saveOptions or session information are provided
         * it means session is created in function itself
         * then we will simply abort the transaction
         */
        this.logger.info('Aborting transaction..');
        return session.abortTransaction();
      } catch {
        // this.logger.error(e);
      }
      return;
    }

    /**
     * else we will throw an error if provided
     * this is required because the parent function must know
     * that execution of this function is facing an error
     */
    throw error;
  }

  /**
   * Please use this method after passing the session object
   * in other functions
   *
   * @param session
   * @protected
   */
  protected assertSessionInTransaction(session: ClientSession): void {
    if (!session.inTransaction()) throw new Error('No Active transaction found in session');
  }

  protected abstract primaryKeyPrefix(): string;

  protected addPagination(aggregations: Record<string, unknown>[], itemsPerPage: number, page = 1, sort = false) {
    if (sort)
      aggregations.push(
        // Sort the orders by createdAt date
        { $sort: { createdAt: -1 } },
      );

    /**
     * Handle Pagination
     * for the list
     */
    if (page < 1) {
      page = 1;
    }

    if (itemsPerPage < 1) itemsPerPage = this._itemsPerPage;

    aggregations.push({ $skip: (page - 1) * itemsPerPage }, { $limit: itemsPerPage });

    return aggregations;
  }

  /**
   * Pls use count interface for result
   *
   * @param aggregations
   * @param baseId
   * @protected
   */
  protected addAggregationCount(aggregations: Record<string, unknown>[], baseId = null) {
    if (!baseId) {
      baseId = 'null';
    }

    aggregations.push({ $group: { _id: baseId, count: { $sum: 1 } } });

    return aggregations;
  }
}
