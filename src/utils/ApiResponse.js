class ApiResponse {
  constructor(data, message='success', statusCode) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
  }
}
export default ApiResponse;