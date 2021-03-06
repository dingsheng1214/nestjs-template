import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsModule } from './cats/cats.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesModule } from './coffees/coffees.module';
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { PublicGuard } from './common/guards/public.guard';
import { WrapResponseInterceptor } from './common/interceptors/wrap-response.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    // 异步模块将在最后解析
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DATABASE,
        autoLoadEntities: true,
        synchronize: true, // 生产环境禁用，自动根据entity实体类生成对应的SQL 表
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true, // 全局模块
      envFilePath: `.env.${
        process.env.NODE_ENV === 'development' ? 'dev' : 'prod'
      }`, // 自定义 env 文件路径
      // ignoreEnvFile: true, // 禁止加载环境变量
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.required().default(5432),
      }),
    }),
    MongooseModule.forRoot('mongodb://mongo:mongo@localhost:27017/nest-demo'),
    CatsModule,
    CoffeesModule,
    CoffeeRatingModule,
    DatabaseModule.register('mysql'),
    PrismaModule,
    ArticlesModule,
  ],
  providers: [
    // 全局异常过滤器
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
    {
      provide: APP_GUARD,
      useClass: PublicGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: WrapResponseInterceptor,
    },
  ],
})
export class AppModule {}
