FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/vite.config.ts ./
COPY frontend/index.html frontend/index.tsx frontend/App.tsx ./
COPY frontend/components ./components
COPY frontend/services ./services
COPY frontend/contexts ./contexts
COPY frontend/pages ./pages
COPY frontend/router ./router
COPY frontend/types.ts ./
RUN npm ci && npm run build

FROM nginx:alpine
COPY deploy/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
