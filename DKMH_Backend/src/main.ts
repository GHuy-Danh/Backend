// DKMH_Backend/src/main.ts

/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // 💡 Xóa { cors: true } ở đây

  // 1. CẤU HÌNH GLOBAL PREFIX (Nếu bạn có dùng)
  // Nếu bạn đã thiết lập API chạy dưới /api (ví dụ: /api/user), hãy thêm dòng này
  app.setGlobalPrefix('api'); 

  // 2. CẤU HÌNH CORS CHI TIẾT
  app.enableCors({
    // Chỉ định chính xác origin của Frontend Angular
    origin: '*', 
    
    // Cho phép các phương thức cơ bản được sử dụng trong CRUD
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    
    // Rất quan trọng nếu bạn sử dụng JWT (Authorization header) hoặc Cookies
    credentials: true, 
  });

  await app.listen(3000, '0.0.0.0');
  console.log('✅ Backend đang chạy tại http://localhost:3000');
  console.log('✅ Backend đang chạy tại http://0.0.0.0:3000');
}
bootstrap();