## ticket 1：Migrate Movies/Reviews to MongoDB + Complete Review CRUD

### 任务描述

将现有基于内存的数据改为 MongoDB 持久化存储，使用 Mongoose 完成 `Movie` 与 `Review` 的数据模型与读写；补全 Review 的新增、查询、更新、删除接口，并在 Review 变动时更新对应 Movie 的 `averageRating`。

### 接口范围

- Movies
  - GET /api/movies
  - GET /api/movies/:id
  - POST /api/movies
  - PATCH /api/movies/:id
  - DELETE /api/movies/:id
- Reviews
  - GET /api/movies/:movieId/reviews
  - POST /api/movies/:movieId/reviews
  - PATCH /api/reviews/:id
  - DELETE /api/reviews/:id

### 验收标准

- [ ] 使用 Mongoose 建模与连接（Movie/Review）
- [ ] Movies 改为 MongoDB 读写
- [ ] Review 的 CRUD 可用
- [ ] Review 变动后 Movie.averageRating 正确更新

---

## ticket 2：Add JWT + RBAC; Restrict Movie Mutations to Admin

### 任务描述

引入 JWT 认证与基于角色的权限控制（RBAC）。仅 `admin` 可以对 Movie 数据执行新增、更新、删除；普通用户仅能对 Review 执行新增、更新、删除（仅限本人创建的 Review）。公共读取接口保持不变。

### 授权规则

- Movies：GET 公开；POST/PATCH/DELETE 仅 `admin`
- Reviews：GET 公开；POST 需登录；PATCH/DELETE 作者本人或 `admin`
- 登录颁发 JWT；请求通过 Authorization: Bearer <token> 认证

### 验收标准

- [ ] 登录获取 JWT；认证失败返回 401
- [ ] 非 `admin` 修改 Movies 返回 403
- [ ] 登录用户可创建 Review；仅作者或 `admin` 可改/删
- [ ] 公共读取接口可用
