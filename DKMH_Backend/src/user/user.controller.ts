// D:\Tai lieu hoc\DoAnTotNghiep\DKMH_Backend\src\user\user.controller.ts
import { 
    Controller, 
    Post, 
    Get, 
    Put, 
    Delete, 
    Body, 
    Param, 
    HttpCode, 
    HttpStatus 
} from '@nestjs/common';
import type { UserDto } from './user.service'; // UserDto chỉ là kiểu (type)
import type { User } from './user.schema'; // User chỉ là kiểu (type)
import { UserService } from './user.service';

// 💡 Chuẩn hóa cấu trúc phản hồi
interface ResponseData<T> {
    success: boolean;
    message: string;
    data?: T; 
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() body: { id: string; password: string }) {
    // Hàm login đã trả về { success, data } nên không cần thêm logic wrapper
    return this.userService.login(body.id, body.password);
  }

// ----------------------------------------------------
// 🔹 API QUẢN LÝ NGƯỜI DÙNG (Dành cho Admin)
// ----------------------------------------------------
    
    // 1. ✅ GET ALL: PHẢI LÊN ĐẦU VÀ CHUẨN HÓA CẤU TRÚC
  @Get() 
  async findAll(): Promise<ResponseData<User[]>> { // Dùng User[] từ service
    const users = await this.userService.findAll();
    return { 
        success: true, 
        message: 'Lấy danh sách người dùng thành công', 
        data: users 
    };
  } 

  @Get(':id') 
  async findOne(@Param('id') id: string): Promise<ResponseData<User>> { 
    const user = await this.userService.findOne(id);
    return { 
        success: true, 
        message: `Lấy thông tin người dùng ${id} thành công.`, 
        data: user 
    };
  }

  @Post() 
  async create(@Body() userData: UserDto): Promise<ResponseData<User>> { 
    const result = await this.userService.create(userData); 
    return { success: true, message: 'Thêm người dùng thành công.', data: result };
  }

  @Put(':id/change-password')
  async changePassword(@Param('id') id: string, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.userService.changePassword(id, body.currentPassword, body.newPassword);
  }

  @Put(':id') 
  async update(@Param('id') id: string, @Body() userData: UserDto): Promise<ResponseData<User>> { 
    const result = await this.userService.update(id, userData); 
    return { success: true, message: `Cập nhật người dùng ${id} thành công.`, data: result };
  }

  @Delete(':id') 
  @HttpCode(HttpStatus.OK) // Trả về 200 OK để Frontend dễ nhận message
  async delete(@Param('id') id: string): Promise<ResponseData<{}>> { 
    await this.userService.delete(id); 
    return { success: true, message: `Xóa người dùng ${id} thành công.` };
  }

// ----------------------------------------------------
// 🔹 API HỒ SƠ CÁ NHÂN (Giữ nguyên)
// ----------------------------------------------------
// Giữ nguyên các route này, chúng không xung đột với các route Admin.

  @Get([':id','profile/:id']) getProfile(@Param('id') id: string) { 
    return this.userService.findOne(id); 
} 

  @Put([':id','profile/:id']) 
async updateProfile(@Param('id') id: string, @Body() userData: UserDto) {
    const { loai, mat_khau, ...dataToUpdate } = userData; 

    return this.userService.update(id, dataToUpdate); 
}

}