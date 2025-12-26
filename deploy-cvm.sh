# 第一阶段：构建
FROM maven:3.9.0-eclipse-temurin-17-alpine as builder

WORKDIR /app

# 复制 POM 和源代码
COPY pom.xml mvnw mvnw.cmd ./
COPY .mvn ./.mvn
COPY src ./src

# 编译项目
RUN ./mvnw clean package -DskipTests

# 第二阶段：运行
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 从构建阶段复制 JAR
COPY --from=builder /app/target/tunnel-monitor-*.jar app.jar

# 设置环境变量
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
    CMD wget --quiet --tries=1 --spider http://localhost:8080/api/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]
