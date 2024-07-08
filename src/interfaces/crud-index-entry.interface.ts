import { ObjectId } from 'mongoose';

export default interface CrudIndexEntryInterface {
  _id: ObjectId;
  type: 'sequenceEntry';
  sequenceValue: number;
  date: Date;
}
