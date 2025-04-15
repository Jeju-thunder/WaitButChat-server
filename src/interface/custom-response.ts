export default class CustomResponse<T> {
    readonly code: number;
    readonly status: string;
    readonly message: string;
    readonly data: T;
  
    constructor(code: number, status: string, message: string, data: T) {
      this.code = code;
      this.status = status;
      this.message = message;
      this.data = data;
    }
  }
  