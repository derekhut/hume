# 构建阶段
FROM node:18-alpine AS builder

# 设置npm镜像源为阿里源
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

COPY . .

# 构建
RUN npm run build

# 生产阶段
FROM node:18-alpine AS runner

# 设置npm镜像源为阿里源
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app

# 复制构建文件和依赖
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 只安装生产依赖
RUN npm install --production

ENV OPENAI_API_KEY=

EXPOSE 3000
CMD ["npm", "start"]