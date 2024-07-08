import { AxiosError } from 'axios';
import { Request } from 'express';
import _ from 'lodash';

export default class ApiResponse {
  private static _instance: ApiResponse;
  private result: string;
  private success: boolean;
  private appCode: number;
  private httpCode: number;
  private message: string;
  private errors: string[] = [];
  private page: number;
  private itemsCount: number;
  private allItemsCount: number;

  public constructor() {
    this.page = -1;
    this.itemsCount = -1;
    this.allItemsCount = -1;
  }

  public static getInstance() {
    return this._instance || (this._instance = new ApiResponse());
  }

  public addError<T extends string | Error>(error: T) {
    if (error) {
      if (error instanceof Error) {
        this.errors.push(error.message);
      } else {
        this.errors.push(error);
      }
    } else {
      this.errors = [];
    }
  }

  public setErrors<T extends string | Error = string>(errors: T[]) {
    // Clear the errors var
    this.errors = [];

    // Now start adding the values
    if (!errors) return;
    for (const err of errors) {
      if ((err as AxiosError<ApiResponse>).isAxiosError) {
        _.map(((err as AxiosError)?.response?.data as ApiResponse)?.errors, _err => this.addError<string>(_err));
      } else {
        this.addError<T>(err);
      }
    }
  }

  public getErrors(): string[] {
    return this.errors;
  }

  public setAppCode(code: number): this {
    this.appCode = code;
    return this;
  }

  public getAppCode(): number {
    return this.appCode || 500;
  }

  public setHttpCode(code: number): this {
    this.httpCode = code;
    return this;
  }

  public getHttpCode(): number {
    return this.httpCode || 200;
  }

  public setMessage(message: string): this {
    this.message = message;
    return this;
  }

  public getMessage(): string {
    return this.message;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setResult(result: any): this {
    this.result = result;
    return this;
  }

  public getResult(): string {
    return this.result;
  }

  public setItemsCount(count: number): this {
    this.itemsCount = count;
    return this;
  }

  public getItemsCount(): number {
    return this.itemsCount;
  }

  public setPage(page: number): this {
    this.page = page;
    return this;
  }

  public getPage(): number {
    return this.page;
  }

  public setSuccess(success = false): this {
    this.success = success;
    return this;
  }

  public getSuccess(): boolean {
    return this.success;
  }

  public setAllItemsCount(totalItems: number): this {
    this.allItemsCount = totalItems;
    return this;
  }

  public getAllItemsCount(): number {
    return this.allItemsCount;
  }

  public markSuccess() {
    this.setResult(true);
    this.setSuccess(true);
    this.setMessage('Success');

    return this;
  }

  public updateRequest(req: Request, code: number, message: string, errors: string[]): boolean {
    if (!req) {
      return false;
    }

    if (code) req.appCode = code;
    if (message) req.message = message;
    if (errors && errors.length > 0) {
      if (!req.errors) {
        req.errors = [];
      }
      for (const error of errors) {
        req.errors.push(error);
      }
    }

    return true;
  }

  public createResponse(): Record<string, unknown> {
    const data = {};

    data['success'] = this.success;
    data['code'] = this.appCode;

    if (this.itemsCount > -1) {
      data['itemsCount'] = this.itemsCount;
    }

    if (this.page > -1) {
      data['page'] = this.page;
    }

    if (this.allItemsCount > -1) {
      data['allItemsCount'] = this.allItemsCount;
    }

    data['message'] = this.message;
    data['errors'] = this.errors;
    data['result'] = this.result;

    return data;
  }

  public formatErrors(err: unknown) {
    switch (err['type']) {
      case 'any.empty': {
        err['message'] = 'Value should not be empty!';
        break;
      }
      case 'string.min': {
        err['message'] = `Value should have at least ${err['context'].limit} characters!`;
        break;
      }
      case 'string.max': {
        err['message'] = `Value should have at most ${err['context'].limit} characters!`;
        break;
      }
      default: {
        break;
      }
    }

    return err;
  }
}
