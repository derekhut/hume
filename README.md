# 土壤监测系统后端服务

Spring Boot实现的土壤监测系统后端服务，支持土壤数据采集和摄像头监控功能。

## 功能特性

- 土壤数据采集API
  - 支持温度、湿度、电导率、pH值、氮磷钾含量等数据采集
  - 数据实时存储和查询
- 萤石摄像头集成
  - 支持实时预览
  - 支持抓拍功能
  - 可配置图片质量

## 技术栈

- Spring Boot 3.2.1
- Spring Data JPA
- PostgreSQL
- Lombok
- Validation API

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.6+
- PostgreSQL 12+

### 配置说明

1. 数据库配置（application.properties）:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/soil_monitor
spring.datasource.username=postgres
spring.datasource.password=postgres
```

2. 萤石摄像头配置:
```properties
ezviz.api.url=https://open.ys7.com/api/lapp
ezviz.app-key=your-app-key
ezviz.app-secret=your-app-secret
ezviz.access-token=your-access-token
```

### 运行应用

```bash
# 打包
./mvnw clean package

# 运行
./mvnw spring-boot:run
```

## API文档

### 土壤数据采集

POST /api/soil/data

:
```json
{
  "deviceId": "device-001",
  "temperature": 25.5,
  "humidity": 60.0,
  "ec": 1.2,
  "ph": 6.8,
  "n": 14.5,
  "p": 10.2,
  "k": 20.1
}
```

:
```json
{
  "msg": "操作成功!",
  "code": "200",
  "data": {
    "id": 1,
    "deviceId": "device-001",
    "temperature": 25.5,
    "humidity": 60.0,
    "ec": 1.2,
    "ph": 6.8,
    "n": 14.5,
    "p": 10.2,
    "k": 20.1,
    "timestamp": "2024-01-05T10:30:00"
  }
}
```

### 摄像头抓拍

POST /api/camera/capture


- deviceSerial: 设备序列号（必填）
- channelNo: 通道号（必填）
- quality: 图片质量（可选，1-3）

:
```json
{
  "msg": "操作成功!",
  "code": "200",
  "data": {
    "picUrl": "https://example.com/snapshot.jpg"
  }
}
```

## 错误处理

API响应都遵循统一的格式:
```json
{
  "msg": "错误信息",
  "code": "错误代码",
  "data": null
}
```

#~/repos/hume/soil-monitor/
:
- 200: 操作成功
- 400: 参数验证失败
- 500: 系统内部错误

## 注意事项

1. 确保PostgreSQL数据库已创建并运行
2. 配置正确的萤石摄像头API密钥
3. 所有请求参数都需要进行验证
4. API响应格式统一

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 发起Pull Request

## 许可证

MIT License
