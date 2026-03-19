# input: 无
# output: 无
# pos: 系统/通用
# 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
FROM node:20-alpine AS base
WORKDIR /app

# 安装构建工具和 Python（argon2 需要）
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm ci && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
EXPOSE 5500
CMD sh -c "node dist/main.js"
