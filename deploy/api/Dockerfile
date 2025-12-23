# input: 无
# output: 无
# pos: 部署/配置
# 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm ci && npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/dist ./dist
EXPOSE 5500
CMD sh -c "npx prisma migrate deploy && node dist/main.js"

