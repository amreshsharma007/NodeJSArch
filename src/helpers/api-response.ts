import { AxiosError } from 'axios';
import { Request } from 'express';
import _, { isArray } from 'lodash';

export default class ApiResponse<T> {
  private result: T;
  private success: boolean;
  private appCode: number;
  private httpCode: number;
  private message: string;
  private errors = {} as { [type: string]: string[] };
  private page: number;
  private itemsCount: number;
  private allItemsCount: number;
  private static ERR_KEY_DEFAULT = 'default';

  public constructor() {
    this.page = -1;
    this.itemsCount = -1;
    this.allItemsCount = -1;
  }

  public addError(err: string | string[] | Error | AxiosError<ApiResponse<T>>): void {
    if (!err) this.errors = {};

    if ((err as AxiosError<ApiResponse<T>>).isAxiosError) {
      _.map(((err as AxiosError)?.response?.data as ApiResponse<T>)?.errors, _err => this.addError(_err));
    } else if (err instanceof Error) {
      this.errors[err.name].push(err.message);
    } else if (isArray(err)) {
      this.errors[ApiResponse.ERR_KEY_DEFAULT].push(...err);
    } else {
      this.errors[ApiResponse.ERR_KEY_DEFAULT].push(err);
    }
  }

  public setErrors(errors: string[] | Error[] | AxiosError<ApiResponse<T>>[]): void {
    // Clear the errors var
    this.errors = {};

    // Now start adding the values
    if (!errors) return;
    for (const err of errors) {
      this.addError(err);
    }
  }

  public getErrors(): { [key: string]: string[] } {
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

  public setResult(result: T): this {
    this.result = result;
    return this;
  }

  public getResult(): T {
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

  public markSuccess(): this {
    this.setSuccess(true);
    this.setMessage('Success');
    return this;
  }

  public updateRequest(req: Request, code: number, message: string, errors: string[]): boolean {
    if (!req) return false;

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
}
