根据老师的代码和我一起改造现在的代码, 其中有这些任务:
- 规范返回数据格式, 利用中间件进行改造
  ```
  // {
  //   success: true,
  //   data: object
  // }
  
  // {
  //   success: false,
  //   error: string
  // }
  ```
- 统一处理错误
  - 要用到Joi